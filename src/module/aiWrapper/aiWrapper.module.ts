import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module';
import { AiService } from './service/aiWrapper.service';
import { MessageModule } from '../message/message.module';
import { ConversationModule } from '../conversation/conversation.module';
import { CustomerServiceWorkFlow } from './Workflow/customerService.workflow';
import { ChoosenLLmService } from './service/ChoosenLLm.service';
import { ChatMemoryRedisService } from './ChatMemoryRedis.service';
import { RAGService } from './service/RAG.service';
import { CustomerModule } from '../customer/customer.module';
import { UserSubcribtionModule } from '../userSubcribtion/userSubcribtion.module';

@Module({
  imports: [
    LlmModule,
    MessageModule,
    ConversationModule,
    CustomerModule,
    UserSubcribtionModule,
  ],
  providers: [
    AiService,
    CustomerServiceWorkFlow,
    ChoosenLLmService,
    ChatMemoryRedisService,
    RAGService,
  ],
  exports: [AiService, CustomerServiceWorkFlow, RAGService],
})
export class AiWrapperModule {}
