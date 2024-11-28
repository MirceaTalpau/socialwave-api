import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':postId')
  @ApiBearerAuth()
  findOne(@Param('postId') postId: number) {
    try {
      return this.postService.findOne(postId);
    } catch (e) {
      throw e;
    }
  }
  @Get()
  @ApiBearerAuth()
  findAllByUser(@Req() req) {
    try {
      const userId = req.user;
      return this.postService.findAllByUser(userId);
    } catch (e) {
      throw e;
    }
  }

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor())
  createPost(
    @Req() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[], // This is to capture the uploaded files
  ) {
    try {
      console.log(createPostDto);
      // Initialize empty arrays for images and videos
      const images: Express.Multer.File[] = [];
      const videos: Express.Multer.File[] = [];
      if (files) {
        // Loop through each file and categorize based on mimetype
        files.forEach((file) => {
          if (file.mimetype.startsWith('image/')) {
            images.push(file); // Push the image file into images array
          } else if (file.mimetype.startsWith('video/')) {
            videos.push(file); // Push the video file into videos array
          }
        });
      }
      // Attach the files to the DTO
      createPostDto.images = images.length ? images : undefined;
      createPostDto.videos = videos.length ? videos : undefined;

      const user = req.user;
      createPostDto.userId = user;
      this.postService.createPost(createPostDto);
      return { message: 'Post created successfully' };
    } catch (e) {
      throw e;
    }
  }
  @Delete(':postId')
  @ApiBearerAuth()
  deletePost(@Param('postId') postId: number) {
    try {
      this.postService.deletePost(postId);
      return { message: 'Post deleted successfully' };
    } catch (e) {
      throw e;
    }
  }
}
