import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { FacebookApiService } from './whatsaap/facebookApi.service';
import { wabaService } from './whatsaap/waba.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [IntegrationsController],
  providers: [FacebookApiService, wabaService],
  exports: [FacebookApiService],
})
export class IntegrationsModule {}
