import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { GroqService } from './LlmService/groq.service';
import { LlmService } from './LlmService/llm.service';
@Module({
  controllers: [LlmController],
  providers: [GroqService, LlmService],
  exports: [GroqService],
})
export class LlmModule {}
