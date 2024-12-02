import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostService } from '../post/post.service';
import { FileUploadService } from '../fileupload/fileupload.service';

@Module({
  providers: [UserService, PostService, FileUploadService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
