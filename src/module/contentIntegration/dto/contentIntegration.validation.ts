import { domain } from 'node_modules/zod/v4/core/regexes.cjs';
import z, { ZodType } from 'zod';

const WebsiteConfigSchema = z.object({
  provider: z.literal('website'),
  img: z.string().min(1),
  botName: z.string().min(1).max(50),
  domain: z.string().min(1).optional(),
});

const BotFatherConfigSchema = z.object({
  provider: z.literal('botFather'),
  botName: z.string().min(1),
  accessToken: z.string().min(10),
});
const WabaConfigSchema = z.object({
  provider: z.literal('whatsapp Bussiness'),
  numberPhoneId: z.string().min(1),
  whatsaapBussinessAccountId: z.string().min(1).max(225),
});
const MidtransSchema = z.object({
  provider: z.literal('midtrans'),
  name: z.string().min(1),
  secretKey: z.string().min(1),
  clientKey: z.string().min(1),
});
const XenditSchema = z.object({
  provider: z.literal('xendit'),
  name: z.string().min(1),
  secretKey: z.string().min(1),
});
const InteractiveQrisSchema = z.object({
  provider: z.literal('qris'),
  name: z.string().min(1),
  apiKey: z.string().min(1),
});

export const ConfigByTypeSchema = z.discriminatedUnion('provider', [
  WebsiteConfigSchema,
  BotFatherConfigSchema,
  WabaConfigSchema,
  MidtransSchema,
  XenditSchema,
  InteractiveQrisSchema,
]);

export class ContentIntegrationValidation {
  static readonly ContentIntegration: ZodType = z.object({
    userIntegrationId: z.string().min(1).max(225),
    type: z.string().min(1).max(100),
    configJson: ConfigByTypeSchema,
  });

  static readonly ChangeContentIntegration: ZodType = z.object({
    id: z.string().min(1).max(225),
    type: z.string().min(1).max(100),
    configJson: ConfigByTypeSchema,
  });
}
