import { forwardRef, Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { FacebookApiService } from './service/waba/facebookApi.service';
import { WabaService } from './service/waba/waba.service';
import { LlmModule } from '../llm/llm.module';
import { BaileysService } from './service/baileys/whatsaap.service';
import { WhatsappAuthService } from './service/baileys/session.service';
import { BotFatherService } from './service/botFather/botFather.service';
import { MessageModule } from '../message/message.module';
import { ConversationModule } from '../conversation/conversation.module';
import { AiWrapperModule } from '../aiWrapper/aiWrapper.module';
import { Integrationservice } from './service/integration.service';
import { BotModule } from '../bot/bot.module';
import { IntegrationApisController } from './integrationApis.controller';
import { WebisteGateway } from './service/webiste/website.gateway';
import { WebsiteService } from './service/webiste/website.service';
import { WebsiteController } from './service/webiste/website.controller';

@Module({
  imports: [LlmModule, MessageModule, ConversationModule, AiWrapperModule],
  controllers: [
    IntegrationsController,
    IntegrationApisController,
    WebsiteController,
  ],
  providers: [
    FacebookApiService,
    WabaService,
    WebisteGateway,
    WebsiteService,
    BotFatherService,
    BaileysService,
    Integrationservice,
    WhatsappAuthService,
  ],
  exports: [
    FacebookApiService,
    BaileysService,
    Integrationservice,
    WabaService,
    BotFatherService,
  ],
})
export class IntegrationsModule {}
