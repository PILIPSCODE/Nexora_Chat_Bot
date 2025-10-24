import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { Logger } from 'winston';
import * as qrcode from 'qrcode';

@Injectable()
export class WhatsaapManagerService {
  private clients: Map<string, Map<string, Client>> = new Map();
  private qrCodes: Map<string, Map<string, string>> = new Map();

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createClient(accountId: string, sessionId: string) {
    if (!this.clients.has(accountId)) {
      this.clients.set(accountId, new Map());
      this.qrCodes.set(accountId, new Map());
    }

    const accountClients = this.clients.get(accountId);
    if (accountClients?.has(sessionId)) {
      this.logger.info(`[${accountId}/${sessionId}] Client Already Exists`);
      return accountClients.get(sessionId);
    }

    const client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true },
    });

    client.on('qr', async (qr) => {
      const qrImage = await qrcode.toDataURL(qr);
      this.logger.info(`[${accountId}/${sessionId}] Client is Ready!`);
      this.qrCodes.get(accountId)?.set(sessionId, qrImage);
    });

    client.on('auth_failure', (e) => {
      this.logger.error(`[${accountId}/${sessionId}] Auth Error ${e}`);
    });

    client.on('disconnected', () => {
      this.logger.info(`Client [${accountId}/${sessionId}] Disconected!`);
      accountClients?.delete(sessionId);
    });

    await client.initialize();
    accountClients?.set(sessionId, client);
    return client;
  }

  getQrCode(accountId: string, sessionId: string): string | null {
    return this.qrCodes.get(accountId)?.get(sessionId) || null;
  }
  getClient(accountId: string, sessionId: string): Client | undefined {
    return this.clients.get(accountId)?.get(sessionId);
  }
}
