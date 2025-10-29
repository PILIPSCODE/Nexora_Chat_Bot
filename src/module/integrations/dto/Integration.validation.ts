import z, { ZodType } from 'zod';

export class IntegrationsValidation {
  static readonly WabaHook: ZodType = z.object({
    wabaId: z.string().min(1).max(20),
    text: z.string().min(1).max(1000),
    from: z.string().min(1).max(50),
  });
}
