import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CommentService } from '../comment/comment.service';

@Module({
  providers: [FeedService, CommentService],
  exports: [FeedService],
})
export class FeedModule {}
