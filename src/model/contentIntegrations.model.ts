export class ContentIntegrationApi<T> {
  type: string;
  configJson: T;
}

export class PostContentIntegration<T> {
  configJson: T;
  userIntegrationId: string;
  type: string;
}
export class ChangeContentIntegration<T> {
  id: string;
  type: string;
  configJson: T;
}

export interface WebsiteConfig {
  provider: 'website';
  botName: string;
  domain: string;
  img: string;
}
export interface botFatherConfig {
  provider: 'botFather';
  botName: string;
  accessToken: string;
}
export interface WabaConfig {
  provider: 'whatsapp Bussiness';
  numberPhoneId: string;
  whatsaapBussinessAccountId: string;
}
export interface MidtransConfig {
  provider: 'midtrans';
  name: string;
  secretKey: string;
  clientKey: string;
}
export interface XenditConfig {
  provider: 'xendit';
  name: string;
  secretKey: string;
}
export interface InteractiveQrisConfig {
  provider: 'qris';
  name: string;
  apiKey: string;
}

import { Prisma } from '@prisma/client';

export function toPrismaJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

export type ContentIntegrationConfig =
  | botFatherConfig
  | WebsiteConfig
  | WabaConfig
  | MidtransConfig
  | XenditConfig
  | InteractiveQrisConfig;
