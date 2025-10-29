import z, { ZodType } from 'zod';

export class LLmValidation {
  static readonly LLM: ZodType = z.object({
    name: z.string().min(1).max(100),
    version: z.string().min(1).max(50),
  });
  static readonly chageLLM: ZodType = z.object({
    id: z.number().min(1).max(225),
    name: z.string().min(1).max(100),
    version: z.string().min(1).max(50),
  });
}
