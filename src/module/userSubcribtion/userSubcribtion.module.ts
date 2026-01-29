import { Module } from '@nestjs/common';
import { UserSubscribtionController } from './userSubcribtion.controller';
import { UserSubscribtionService } from './service/userSubcribtion.service';

@Module({
  imports: [],
  controllers: [UserSubscribtionController],
  providers: [UserSubscribtionService],
  exports: [UserSubscribtionService],
})
export class UserSubcribtionModule {}
