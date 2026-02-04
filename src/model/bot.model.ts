import { Pagination } from './web.model';
import { Bot } from '@prisma/client';

export class BotApi {
  userId: string;
  agentId: string;
  contentIntegrationId: string | null;
  botName: string;
}

export class changeBot {
  id: string;
  agentId: string;
  type: string;
  userId: string;
  integrationId: string | null;
  botName: string;
}
export class startBot {
  botId: string;
  type: string;
  agentId: string;
  contentIntegrationId?: string;
}

export class ChatWebsite {
  botId: string;
  sid: string;
  message: string;
}

export class botStatus {
  botId: string;
  type: string;
  contentIntegrationId?: string;
}

export class ResponseBot {
  botId?: string;
  message?: string;
  type?: string;
  qrCode?: string;
}
export class postBot {
  userId: string;
  agentId: string;
  botName: string;
  type: string;
  contentIntegrationId?: string | null;
}

export class GetModelbot {
  userId?: string;
  page: string;
  limit: string;
}

export class PaginationResponseBot {
  bot: Bot[];
  Pagination: Pagination;
}
