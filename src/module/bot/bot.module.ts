import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './service/bot.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
