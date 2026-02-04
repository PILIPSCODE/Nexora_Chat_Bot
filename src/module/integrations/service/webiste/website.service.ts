import { HttpException, Injectable } from '@nestjs/common';
import { ConversationWrapper } from 'src/model/aiWrapper.model';
import { ChatWebsite } from 'src/model/bot.model';
import { AiService } from 'src/module/aiWrapper/service/aiWrapper.service';
import { GatewayEventService } from 'src/module/gateway/gatewayEventEmiter';
import { PrismaService } from 'src/module/prisma/service/prisma.service';

@Injectable()
export class WebsiteService {
  constructor(
    private aiwrapper: AiService,
    private gatewayEventService: GatewayEventService,
    private prismaService: PrismaService,
  ) {}

  async sendMessage(req: ChatWebsite, sendUpdate: (data: any) => void) {
    const { botId, sid, message } = req;
    const bot = await this.prismaService.bot.findUnique({
      where: {
        id: botId,
      },
      include: {
        agent: true,
      },
    });

    if (!bot) throw new HttpException('Validation Error', 400);

    if (!bot.isActive) return;

    let update = {
      message: `new message from stranger ${sid}`,
      botId: bot?.id,
      type: 'website',
    };

    this.gatewayEventService.emitToUser(`bot:${bot?.id}`, 'bot', update);

    const data: ConversationWrapper = {
      room: `${botId}${sid}`,
      botId: String(bot?.id),
      integrationType: 'website',
      sender: sid,
      humanHandle: false,
      message: {
        text: message,
        type: 'text',
      },
    };

    const response = await this.aiwrapper.wrapper(data, bot.agent);

    if ((response?.data, length !== 0)) {
      sendUpdate(response?.data);
    }
  }
}
