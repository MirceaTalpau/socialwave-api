import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostService } from '../post/post.service';
import { FileUploadService } from '../fileupload/fileupload.service';
import { FollowService } from '../follow/follow.service';
import { CommentService } from '../comment/comment.service';
import { LikeService } from '../like/like.service';
import { NotificationService } from '../notification/notification.service';

@Module({
  providers: [
    UserService,
    PostService,
    FileUploadService,
    FollowService,
    CommentService,
    LikeService,
    NotificationService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
