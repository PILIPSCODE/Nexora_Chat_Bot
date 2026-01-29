import { Pagination } from './web.model';
import { UserAgent, Product } from '@prisma/client';

export class UserAgentApi {
  name: string;
  agent: string;
  filePath: string;
  prompt: string | null;
  vectorStatus: string;
}

export class changeUserAgent {
  id: string;
  name: string;
  prompt: string | null;
  agent: string;
  productIds: string[];
  userId: string;
  filePath: string;
}
export class postUserAgent {
  userId: string;
  name: string;
  agent: string;
  productIds: string[];
  filePath: string;
  prompt: string | null;
}

export class GetModelUserAgent {
  userId?: string;
  page: string;
  limit: string;
}

export class PaginationResponseUserAgent {
  UserAgent: UserAgent[];
  Pagination: Pagination;
}

export class UserAgentResponseById {
  id: string;
  name: string;
  prompt: string | null;
  agent: string;
  productIds: string[];
  userId: string;
  filePath: string;
}

export class TestAgent {
  agentId: string;
  question: string;
}
