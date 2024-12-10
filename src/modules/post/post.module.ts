import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { FileUploadService } from '../fileupload/fileupload.service';
import { CommentService } from '../comment/comment.service';
import { LikeService } from '../like/like.service';

@Module({
  providers: [PostService, FileUploadService, CommentService, LikeService],
  controllers: [PostController],
})
export class PostModule {}
