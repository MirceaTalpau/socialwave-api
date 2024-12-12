import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { FileUploadService } from '../fileupload/fileupload.service';

@Module({
  providers: [StoryService, FileUploadService],
  controllers: [StoryController],
})
export class StoryModule {}
