import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CommentService } from '../comment/comment.service';
import { LikeService } from '../like/like.service';
import { PostService } from '../post/post.service';
import { FileUploadService } from '../fileupload/fileupload.service';

@Module({
  providers: [
    FeedService,
    CommentService,
    LikeService,
    PostService,
    FileUploadService,
  ],
  exports: [FeedService],
})
export class FeedModule {}
