import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { FileUploadService } from '../fileupload/fileupload.service';

@Module({
  providers: [PostService, FileUploadService],
  controllers: [PostController],
})
export class PostModule {}
