import z, { ZodType } from 'zod';

export class BotValidation {
  static readonly WabaHook: ZodType = z.object({
    name: z.string().min(1).max(50),
    prompt: z.string().min(1).max(1000),
    llm: z.string().min(1).max(50),
    type: z.string().min(1).max(50),
  });
}
