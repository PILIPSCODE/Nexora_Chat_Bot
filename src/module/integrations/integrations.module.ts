import { Module } from '@nestjs/common';
import { WhatsaapModule } from './whatsaap/whatsaap.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [WhatsaapModule, TelegramModule]
})
export class IntegrationsModule {}
