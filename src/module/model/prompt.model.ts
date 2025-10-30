import { Pagination } from './web.model';
import { Prompt } from '@prisma/client';

export class PromptApi {
  name: string;
  prompt: string;
  modelName?: string;
}

export class changePrompt {
  id: string;
  name: string;
  prompt: string;
  modelName?: string;
}
export class postPrompt {
  userId: string;
  name: string;
  prompt: string;
  modelName?: string;
}

export class GetModelPrompt {
  userId?: string;
  page: string;
  limit: string;
}

export class PaginationResponsePrompt {
  Prompt: Prompt[];
  Pagination: Pagination;
}
