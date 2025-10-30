import { LargeLanguageModel as LLM } from '@prisma/client';
import { Pagination } from './web.model';

export class LlmApi {
  name: string;
  version: string;
}

export class changeLlm {
  id: number;
  name: string;
  version: string;
}

export class GetModelLlm {
  page: string;
  limit: string;
}

export class PaginationResponse {
  LLM: LLM[];
  Pagination: Pagination;
}
