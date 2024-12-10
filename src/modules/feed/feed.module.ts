import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CommentService } from '../comment/comment.service';
import { LikeService } from '../like/like.service';

@Module({
  providers: [FeedService, CommentService, LikeService],
  exports: [FeedService],
})
export class FeedModule {}
