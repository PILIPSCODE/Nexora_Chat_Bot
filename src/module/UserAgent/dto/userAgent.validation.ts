import z, { ZodType } from 'zod';

export class UserAgentValidation {
  static readonly UserAgent: ZodType = z.object({
    name: z.string().min(1).max(100),
    prompt: z.string().min(0).max(50000).optional(),
    productIds: z.array(z.string().min(1).max(225)).min(1),
    agent: z.string().min(1).max(100),
    filePath: z.string().min(1).max(100),
    userId: z.string().min(1).max(225),
  });
  static readonly chageUserAgent: ZodType = z.object({
    id: z.string().min(1).max(225),
    name: z.string().min(1).max(100),
    productIds: z.array(z.string().min(1).max(225)).min(1),
    agent: z.string().min(1).max(100),
    userId: z.string().min(1).max(225),
    filePath: z.string().min(1).max(100),
    prompt: z.string().min(0).max(50000).optional(),
  });
  static readonly Pagination: ZodType = z.object({
    page: z.string().min(1).max(50),
    limit: z.string().min(1).max(50),
  });
}
