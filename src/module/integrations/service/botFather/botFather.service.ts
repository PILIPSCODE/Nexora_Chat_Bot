import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserAgent } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import { ConversationWrapper } from 'src/model/aiWrapper.model';
import { botStatus } from 'src/model/bot.model';
import { AiService } from 'src/module/aiWrapper/service/aiWrapper.service';
import { CryptoService } from 'src/module/common/other/crypto.service';
import { GatewayEventService } from 'src/module/gateway/gatewayEventEmiter';
import { PrismaService } from 'src/module/prisma/service/prisma.service';

@Injectable()
export class BotFatherService implements OnModuleInit {
  constructor(
    private aiService: AiService,
    private prismaService: PrismaService,
    private gatewayEventService: GatewayEventService,
    private cryptoService: CryptoService,
  ) {}
  private bots = new Map<string, TelegramBot>();
  private callbacks = new Map<string, (data: any) => void>();
  private handlers = new Map<
    string,
    {
      message: (msg: any) => void;
      pollingError: (err: any) => void;
    }
  >();

  async onModuleInit() {
    const botActives = await this.prismaService.bot.findMany({
      where: {
        isActive: true,
        type: 'botFather',
      },
    });

    botActives.map(async (e) => {
      const findAgent = await this.prismaService.userAgent.findUnique({
        where: { id: e.agentId },
      });
      if (findAgent) {
        const contentIntegration =
          await this.prismaService.contentIntegration.findUnique({
            where: {
              id: String(e.contentIntegrationId),
            },
          });

        const configJson: any = contentIntegration?.configJson;
        const accessToken = await this.cryptoService.decrypt(
          configJson.accessToken,
        );

        this.startBot(accessToken, e.id, findAgent);
      }
    });
  }

  // Function to start and create connection botfather
  async startBot(
    token: string,
    botId: string,
    agent: UserAgent,
    sendUpdate?: (data: any) => void,
  ) {
    if (sendUpdate) {
      this.callbacks.set(botId, sendUpdate);
    }

    const cb = this.callbacks.get(botId);
    try {
      if (this.bots.has(botId)) {
        cb?.({ message: '⚠️bot Connected to Telegram', botId: botId });
        return;
      }
      const bot = new TelegramBot(token, { polling: true });

      const pollingError = (error) => {
        cb?.({
          message: 'Unauthorization token invalid!!',
          botId: botId,
          type: 'botFather',
        });
        bot.stopPolling();
        this.disableBot(botId);
      };

      const Connection = () => {
        this.bots.set(botId, bot);
        this.updateBotStatus({ botId: botId, type: 'botFather' }, true);

        cb?.({
          message: 'Bot Connected To Telegram',
          botId: botId,
          type: 'botFather',
        });
      };

      const message = async (msg) => {
        if (msg.text) {
          const data: ConversationWrapper = {
            room: `${botId}${msg.from?.id}`,
            botId: botId,
            sender: String(msg.chat.id),
            integrationType: 'botFather',
            humanHandle: false,
            message: {
              text: msg.text,
              type: 'text',
            },
          };
          const aiResponse = await this.aiService.wrapper(data, agent);

          let update = {
            message: `new message from${msg.chat.id}`,
            botId: botId,
            type: 'botFather',
          };

          if (aiResponse?.data.messages.length !== undefined) {
            aiResponse.data.messages.map(async (e) => {
              this.sendMessage(botId, msg.chat.id, e.text, e.type, e.image);
            });
          }
          this.gatewayEventService.emitToUser(`bot:${botId}`, 'bot', update);
        }
      };

      const deletedToken = () => {
        let update = {
          message: '❌ Invalid or deleted bot token ',
          botId,
          type: 'botFather',
        };
        this.gatewayEventService.emitToUser(`bot:${botId}`, 'bot', update);

        this.disableBot(botId);

        bot.stopPolling();
      };

      // ------ Sequence code run here ------

      bot.on('polling_error', pollingError);

      const isconnect = await bot.getMe();

      if (!isconnect) {
        deletedToken();
      }

      bot.on('message', message);
      Connection();

      this.handlers.set(botId, {
        message,
        pollingError,
      });

      // ------ End Sequence ------
    } catch (error) {
      cb?.({
        message: `Cannot Connected Because: ${error}`,
        botId: botId,
        type: 'botFather',
      });
      return;
    }
  }

  // Function to disable connection botfather
  async disableBot(botId: string, cb?: (data: any) => void) {
    const bot = this.bots.get(botId);
    const handler = this.handlers.get(botId);

    if (!bot) {
      cb?.({
        message: 'Bot Id Not Found',
        botId: botId,
        type: 'botFather',
      });
      return;
    }

    this.updateBotStatus({ botId: botId, type: 'telegram' }, false);
    cb?.({
      message: 'Bot Disconnected to Telegram',
      botId: botId,
      type: 'botFather',
    });

    try {
      if (handler) {
        bot.off('message', handler.message);
        bot.off('polling_error', handler.pollingError);
      }
      await bot.stopPolling();

      bot.removeAllListeners();

      this.bots.delete(botId);
      this.callbacks.delete(botId);
      this.handlers.delete(botId);
    } catch (e) {
      cb?.({
        message: `Error disabling bot Because: ${e}`,
        botId: botId,
        type: 'botFather',
      });
    }
  }

  async sendMessage(
    botId: string,
    sender: string,
    text: string,
    type: string,
    payload?: any,
  ) {
    const bot = this.bots.get(botId);
    if (!bot) return;

    if (type === 'image') {
      await bot.sendPhoto(sender, payload, { caption: text });
    } else {
      await bot.sendMessage(sender, text);
    }
  }
  async updateBotStatus(req: botStatus, status: boolean) {
    await this.prismaService.bot.update({
      where: {
        id: req.botId,
      },
      data: {
        isActive: status,
      },
    });
  }
}
