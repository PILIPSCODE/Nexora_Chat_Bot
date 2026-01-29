import { HttpException, Injectable } from '@nestjs/common';
import { BotFatherService } from './botFather/botFather.service';
import { BaileysService } from './baileys/whatsaap.service';
import { startBot } from 'src/model/bot.model';
import { IntegrationsValidation } from '../dto/Integration.validation';
import { ValidationService } from 'src/module/common/other/validation.service';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { BotService } from 'src/module/bot/service/bot.service';
import { Integration, UserAgent } from '@prisma/client';
import { ChangeIntegration, IntegrationApi } from 'src/model/integration.model';
import { CryptoService } from 'src/module/common/other/crypto.service';

@Injectable()
export class Integrationservice {
  constructor(
    private botFatherService: BotFatherService,
    private prismaService: PrismaService,
    private baileysService: BaileysService,
    private validationService: ValidationService,
    private botService: BotService,
    private cryptoService: CryptoService,
  ) {}

  // Bot Integrations
  async startBot(req: startBot, sendUpdate: (data: any) => void) {
    const Reqvalid: startBot = this.validationService.validate(
      IntegrationsValidation.StartBot,
      req,
    );
    const { data, type, botId, agentId } = Reqvalid;
    if (!Reqvalid) {
      sendUpdate({ message: 'Validation Error' });
    }

    const findBot = await this.prismaService.bot.findFirst({
      where: {
        id: botId,
      },
    });

    if (!findBot) {
      sendUpdate({ message: 'Cannot Find BotID' });
      return;
    }

    const findAgent = await this.findAgent(agentId);
    if (!findAgent) {
      sendUpdate({ message: 'Cannot Find AgentID' });
      return;
    }

    if (type === 'baileys') {
      this.baileysService.startBot(botId, findAgent, sendUpdate);
    } else if (type === 'botFather') {
      this.botFatherService.startBot(
        String(data),
        botId,
        findAgent,
        sendUpdate,
      );
    } else {
      sendUpdate({
        message: 'Bot Connected To Waba',
        data: { type: 'whatsapp Bussiness', botId: req.botId },
      });
      await this.botService.updateBotStatus(req, true);
    }
  }

  async findAgent(agentId: string) {
    const findAgent = await this.prismaService.userAgent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!findAgent) return false;

    return findAgent;
  }

  async disableBot(req: startBot, sendUpdate: (data: any) => void) {
    const Reqvalid: startBot = this.validationService.validate(
      IntegrationsValidation.StartBot,
      req,
    );
    const { type, botId } = Reqvalid;
    if (!Reqvalid) {
      sendUpdate({ message: 'Validation Error' });
    }
    const findBot = await this.prismaService.bot.findFirst({
      where: {
        id: botId,
      },
    });

    if (!findBot) {
      sendUpdate({ message: 'Cannot Find BotID ' });
      return;
    }

    if (type === 'baileys') {
      this.baileysService.disableBot(botId, sendUpdate);
    } else if (type === 'botFather') {
      this.botFatherService.disableBot(botId, sendUpdate);
    } else {
      sendUpdate({
        message: 'Bot Disconnected To Waba',
        data: { type: 'whatsapp Bussiness', botId: req.botId },
      });
      await this.botService.updateBotStatus(req, false);
    }
  }

  async getIntegration(): Promise<Integration[]> {
    const data = await this.prismaService.integration.findMany();

    return data;
  }

  async getIntegrationbyId(id: string): Promise<Integration> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.integration.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!data) throw new HttpException('Cannot Find Bot', 403);

      return data;
    } catch (error) {
      throw new HttpException('IntegrationId is Invalid', 400);
    }
  }

  async addNewIntegration(req: IntegrationApi): Promise<IntegrationApi> {
    const IntegrationValid: IntegrationApi = this.validationService.validate(
      IntegrationsValidation.Integration,
      req,
    );

    if (!IntegrationValid) throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.integration.create({
      data: IntegrationValid,
    });

    const res: Integration = data;

    return res;
  }

  async editIntegration(req: ChangeIntegration) {
    try {
      const IntegrationValid: ChangeIntegration =
        this.validationService.validate(
          IntegrationsValidation.changeIntegration,
          req,
        );

      if (!IntegrationValid) throw new HttpException('Validation Error', 400);
      const data = await this.prismaService.integration.update({
        where: {
          id: Number(IntegrationValid.id),
        },
        data: {
          name: IntegrationValid.name,
          type: IntegrationValid.type,
        },
      });

      const res: Integration = data;
      return res;
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('IntegrationId is Invalid', 400);
    }
  }

  async deleteIntegration(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      await this.prismaService.integration.delete({
        where: {
          id: Number(id),
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('IntegrationId is Invalid', 400);
    }
  }
}
