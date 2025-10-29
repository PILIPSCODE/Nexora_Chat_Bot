import { Module } from '@nestjs/common';
import { PromptController } from './prompt.controller';
import { PromptService } from './service/prompt.service';

@Module({
  controllers: [PromptController],
  providers: [PromptService],
})
export class PromptModule {}
