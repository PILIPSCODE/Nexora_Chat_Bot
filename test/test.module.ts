import { Module } from '@nestjs/common';
import { testService } from './test.service';

@Module({
  imports: [],
  controllers: [],
  providers: [testService],
})
export class TestModule {}
