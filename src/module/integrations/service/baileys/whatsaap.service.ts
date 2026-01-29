import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  makeWASocket,
  DisconnectReason,
  ConnectionState,
  BaileysEventMap,
} from 'baileys';
import * as qrcode from 'qrcode';
import * as qrcodeT from 'qrcode-terminal';
import { WhatsappAuthService } from './session.service';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { AiService } from 'src/module/aiWrapper/service/aiWrapper.service';
import { ConversationWrapper } from 'src/model/aiWrapper.model';
import { BotService } from 'src/module/bot/service/bot.service';
import { UserAgent } from '@prisma/client';
import { AiResponse } from 'src/model/Rag.model';
import path from 'path';
import { GatewayEventService } from 'src/module/gateway/gatewayEventEmiter';

type StopReason = 'manual' | 'logout';
type MessagesUpsert = BaileysEventMap['messages.upsert'];

@Injectable()
export class BaileysService implements OnModuleInit {
  constructor(
    private whatsappAuth: WhatsappAuthService,
    private prismaService: PrismaService,
    private aiService: AiService,
    private botService: BotService,
    private gatewayEventService: GatewayEventService,
  ) {}

  private bots = new Map<string, any>();
  private botCallbacks = new Map<string, (data: any) => void>();
  private stopReason = new Map<string, StopReason>();

  private handlers = new Map<
    string,
    {
      connectionUpdate: (update: ConnectionState) => void;
      credsUpdate: () => void;
      messageUpsert: (msg: MessagesUpsert) => void;
    }
  >();

  async onModuleInit() {
    const botActives = await this.prismaService.bot.findMany({
      where: {
        isActive: true,
        type: 'baileys',
        numberPhoneWaba: null,
      },
    });

    botActives.map(async (e) => {
      const findAgent = await this.prismaService.userAgent.findUnique({
        where: { id: e.agentId },
      });
      if (findAgent) {
        this.startBot(e.id, findAgent);
      }
    });
  }

  // Function to start and create new connection baileys
  async startBot(
    botId: string,
    agent: UserAgent,
    sendUpdate?: (data: any) => void,
  ) {
    if (sendUpdate) {
      this.botCallbacks.set(botId, sendUpdate);
    }
    const cb = this.botCallbacks.get(botId);
    try {
      if (this.bots.has(botId)) {
        cb?.({
          message: 'Bot Connected To Whatsapp',
          type: 'baileys',
          botId: botId,
        });
        return;
      }

      const { state, saveCreds } =
        await this.whatsappAuth.useDatabaseAuthState(botId);

      const sock = makeWASocket({
        auth: state,
        syncFullHistory: false,
        shouldSyncHistoryMessage: (msg) => false,
      });

      // Function Connection Whatsapp Baileys
      const connectionUpdate = async (update: ConnectionState) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
          const QrCode = await qrcode.toDataURL(qr, { type: 'image/png' });
          qrcodeT.generate(qr, { small: true });
          cb?.({
            message: 'QrCode Generated',
            qrCode: QrCode,
            type: 'baileys',
            botId: botId,
          });
        }
        if (connection === 'open') {
          this.bots.set(botId, sock);
          cb?.({
            message: 'Bot Connected To Whatsapp',
            type: 'baileys',
            botId: botId,
          });
          await this.botService.updateBotStatus(
            { botId: botId, type: 'whatsapp' },
            true,
          );
        } else if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect) {
            const reason = this.stopReason.get(botId);
            if (
              statusCode === 401 ||
              statusCode === 403 ||
              statusCode === DisconnectReason.badSession ||
              statusCode === DisconnectReason.loggedOut
            ) {
              console.log(`[${botId}] 🧨 Session invalid, deleting...`);

              await this.logOut(botId);
              this.stopReason.delete(botId);
              return;
            }

            if (reason === 'manual') {
              console.log(`[${botId}] 🛑 Reconnect dibatalkan (manual stop)`);
              this.stopReason.delete(botId);
              return;
            }

            console.log(`[${botId}] 🔁 Reconnecting...`);
            setTimeout(() => {
              this.startBot(botId, agent);
            }, 10000);
          } else {
            const reason = this.stopReason.get(botId);

            if (reason === 'logout') {
              this.stopReason.delete(botId);
              let update = {
                message: `[${botId}] Logout total, perlu scan ulang. refresh halaman untuk generate qrCode`,
                type: 'baileys',
                botId: botId,
              };

              this.gatewayEventService.emitToUser(
                `bot:${botId}`,
                'bot',
                update,
              );

              await this.logOut(botId);
            }
          }
        }
      };

      // Function Save Session Baileys
      const credsUpdate = async () => {
        await saveCreds();
        if (this.bots.get(botId)) return;
        cb?.({
          message: 'QR berhasil discan. Connecting...',
          botId: botId,
          type: 'baileys',
        });
      };

      // Function Catch MessageUpdate Baileys
      const messageUpsert = async (msg: MessagesUpsert) => {
        try {
          const m = msg.messages[0];
          if (!m.message) return;
          if (!m.key.fromMe) {
            const sender = m.key.remoteJid;
            if (
              !sender?.endsWith('@lid') &&
              !sender?.endsWith('@s.whatsapp.net')
            )
              return;
            const text =
              m.message?.conversation?.toLowerCase() ||
              m.message?.extendedTextMessage?.text;

            if (text) {
              console.log(text);
              let update = {
                message: `new message from ${sender}`,
                botId: botId,
                type: 'baileys',
              };

              this.gatewayEventService.emitToUser(
                `bot:${botId}`,
                'bot',
                update,
              );
              const data: ConversationWrapper = {
                room: `${botId}${sender}`,
                botId: botId,
                sender: sender,
                integrationType: 'baileys',
                humanHandle: false,
                message: {
                  text: text,
                  type: 'text',
                },
              };
              const aiResponse: AiResponse | undefined =
                await this.aiService.wrapper(data, agent);

              if (aiResponse?.messages.length !== undefined) {
                aiResponse.messages.map(async (e) => {
                  await this.sendMessage(
                    botId,
                    sender,
                    e.text,
                    e.type,
                    e.image,
                  );
                });
              }
            }
          }
        } catch (err: any) {
          if (err.message?.includes('No session found to decrypt message')) {
            console.warn('⚠️ Pesan tidak bisa didekripsi, lewati.');
            let update = {
              message: `Warning ⚠️ Pesan tidak bisa didekripsi`,
              botId: botId,
              type: 'baileys',
            };
            this.gatewayEventService.emitToUser(`bot:${botId}`, 'bot', update);
            return;
          }

          let update = {
            message: `Error ❌ saat memproses pesan`,
            botId: botId,
            type: 'baileys',
          };

          this.gatewayEventService.emitToUser(`bot:${botId}`, 'bot', update);
          console.error('❌ Error saat memproses pesan:', err);
        }
      };

      // ------ Sequence code run here ------

      // Socket and Event Baileys
      sock.ev.on('connection.update', connectionUpdate);
      sock.ev.on('creds.update', credsUpdate);
      sock.ev.on('messages.upsert', messageUpsert);

      this.handlers.set(botId, {
        connectionUpdate,
        credsUpdate,
        messageUpsert,
      });

      // ------ End Sequence ------
    } catch (err) {
      cb?.({
        message: `Cannot StartBot Because: ${err}`,
        botId: botId,
        type: 'baileys',
      });
    }
  }

  // Function to disbale connection baileys
  async disableBot(botId: string, cb?: (data: any) => void) {
    this.stopReason.set(botId, 'manual');
    const sock = this.bots.get(botId);
    const handler = this.handlers.get(botId);

    if (sock) {
      if (handler) {
        sock.ev.off('connection.update', handler.connectionUpdate);
        sock.ev.off('creds.update', handler.credsUpdate);
        sock.ev.off('messages.upsert', handler.messageUpsert);
      }

      await sock.logout();
      cb?.({
        message: 'Bot Disconnected to Whatsapp',
        botId: botId,
        type: 'baileys',
      });

      this.bots.delete(botId);
      this.botCallbacks.delete(botId);
      this.handlers.delete(botId);

      await this.botService.updateBotStatus(
        { botId: botId, type: 'whatsapp' },
        false,
      );
    }
  }

  // Function to handle when user delete session scan
  async logOut(botId: string) {
    this.stopReason.set(botId, 'logout');
    const botCallbacks = this.botCallbacks.get(botId);

    this.disableBot(botId, botCallbacks);

    await this.botService.updateBotStatus(
      { botId: botId, type: 'whatsapp' },
      false,
    );
    await this.prismaService.whatsappSession.delete({
      where: {
        id: botId,
      },
    });

    await this.prismaService.whatsappKeys.deleteMany({
      where: {
        sessionId: botId,
      },
    });
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
      await bot.sendMessage(String(sender), {
        image: {
          url: path.join(process.cwd(), payload),
        },
        caption: text,
      });
    } else {
      await bot.sendMessage(sender, {
        text,
      });
    }
  }
}
