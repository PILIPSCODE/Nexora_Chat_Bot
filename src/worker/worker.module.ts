import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VectorWorkerService } from './vector.worker';
import { UserAgentVectorIngestionService } from './ingestion/UserAgentVectorIngestion.service';
import { UserAgentEventPublisher } from './redisPublisher/userAgentEventPublisher';
import { TempCleanupWorkerService } from './cleanup/tempCleanup.worker';
import { PrismaModule } from 'src/module/prisma/prisma.module';
import { VectorModule } from 'src/module/vector/vector.module';
import { EmbeddingModule } from 'src/module/embedding/embedding.module';
import { RedisModule } from 'src/module/redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    VectorModule,
    EmbeddingModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    VectorWorkerService,
    UserAgentVectorIngestionService,
    UserAgentEventPublisher,
    TempCleanupWorkerService,
  ],
})
export class WorkerModule {}

