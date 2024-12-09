import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostService } from '../post/post.service';
import { FileUploadService } from '../fileupload/fileupload.service';
import { FollowService } from '../follow/follow.service';

@Module({
  providers: [UserService, PostService, FileUploadService, FollowService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
