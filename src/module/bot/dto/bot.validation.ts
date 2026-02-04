import z, { ZodType } from 'zod';

export class BotValidation {
  static readonly WabaHook: ZodType = z.object({
    name: z.string().min(1).max(50),
    Bot: z.string().min(1).max(1000),
    type: z.string().min(1).max(50),
  });

  static readonly Bot: ZodType = z.object({
    agentId: z.string().min(1).max(225),
    userId: z.string().min(1).max(225),
    contentIntegrationId: z.string().min(0).max(700).optional(),
    botName: z.string().min(1).max(50),
    type: z.string().min(1).max(50),
  });
  static readonly changeBot: ZodType = z.object({
    id: z.string().min(1).max(225),
    agentId: z.string().min(1).max(225),
    userId: z.string().min(1).max(225),
    contentIntegrationId: z.string().min(0).max(700).optional(),
    type: z.string().min(1).max(50),
    botName: z.string().min(1).max(50),
  });
  static readonly Pagination: ZodType = z.object({
    page: z.string().min(1).max(50),
    limit: z.string().min(1).max(50),
  });
  static readonly StartBot: ZodType = z.object({
    id: z.string().min(1).max(225),
    type: z.string().min(1).max(50),
  });
}
