import { ApiBearerAuth } from '@nestjs/swagger';
import { StoryService } from './story.service';
import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Get()
  @ApiBearerAuth()
  async getStoriesByUserId(@Req() req) {
    const userId = req.user;
    return this.storyService.getStoriesByUserId(userId);
  }

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor())
  async createStory(@Req() req, @UploadedFiles() files: Express.Multer.File) {
    const userId = req.user;
    if (files.mimetype.startsWith('image/')) {
      return this.storyService.createStory(userId, files);
    } else if (files.mimetype.startsWith('video/')) {
      return this.storyService.createStory(userId, null, files);
    }
  }
}
