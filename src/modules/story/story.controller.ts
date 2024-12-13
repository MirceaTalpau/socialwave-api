import { ApiBearerAuth } from '@nestjs/swagger';
import { StoryService } from './story.service';
import {
  Controller,
  Delete,
  Get,
  Param,
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
  async createStory(@Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    const userId = req.user;
    if (files) {
      // Loop through each file and categorize based on mimetype
      files.forEach(async (file) => {
        if (file.mimetype.startsWith('image/')) {
          await this.storyService.createStory(userId, file); // Create a story with the image file
        } else if (file.mimetype.startsWith('video/')) {
          await this.storyService.createStory(userId, null, file); // Create a story with the video file
        }
      });
    }
    return { message: 'Story created successfully' };
  }

  @Delete(':storyId')
  @ApiBearerAuth()
  async deleteStory(@Req() req, @Param('storyId') storyId: number) {
    const userId = req.user;
    return this.storyService.deleteStory(storyId, userId);
  }
}
