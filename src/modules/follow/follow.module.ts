import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { NotificationService } from '../notification/notification.service';

@Module({
  providers: [FollowService, NotificationService],
  controllers: [FollowController],
})
export class FollowModule {}
