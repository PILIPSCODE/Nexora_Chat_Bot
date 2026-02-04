import z, { ZodType } from 'zod';

export class IntegrationsValidation {
  static readonly WabaHook: ZodType = z.object({
    wabaId: z.string().min(1).max(20),
    text: z.string().min(1).max(1000),
    from: z.string().min(1).max(50),
    numberPhoneId: z.string().min(1).max(50),
  });
  static readonly StartBot: ZodType = z.object({
    botId: z.string().min(1).max(225),
    type: z.string().min(1).max(100),
    contentIntegrationId: z.string().min(1).max(700).optional(),
    numberPhoneWaba: z.string().min(1).max(225).optional(),
    agentId: z.string().min(1),
  });
  static readonly Integration: ZodType = z.object({
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(100),
  });
  static readonly changeIntegration: ZodType = z.object({
    id: z.string().min(1).max(225),
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(100),
  });
}
