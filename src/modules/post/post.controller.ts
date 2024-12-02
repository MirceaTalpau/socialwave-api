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
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':postId')
  @ApiBearerAuth()
  async findOne(@Param('postId') postId: number) {
    try {
      return await this.postService.findOne(postId);
    } catch (e) {
      throw e;
    }
  }
  @Get()
  @ApiBearerAuth()
  async findAllByUser(@Req() req) {
    try {
      const userId = req.user;

      return await this.postService.findAllByUser(userId);
    } catch (e) {
      throw e;
    }
  }

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor())
  async createPost(
    @Req() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[], // This is to capture the uploaded files
  ) {
    try {
      console.log(createPostDto);
      // Initialize empty arrays for images and videos
      const images: Express.Multer.File[] = [];
      const videos: Express.Multer.File[] = [];
      console.log('Files:', files);
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
      createPostDto.images = images.length ? images : createPostDto.images;
      createPostDto.videos = videos.length ? videos : createPostDto.videos;
      console.log('Images:', createPostDto.images);
      const user = req.user;
      createPostDto.userId = user;
      await this.postService.createPost(createPostDto);
      console.log('User in request:', req.user); // Debugging
      return { message: 'Post created successfully' };
    } catch (e) {
      console.log('IN CONTROLLER', e);
      throw new Error(e);
    }
  }
  @Delete(':postId')
  @ApiBearerAuth()
  async deletePost(@Param('postId') postId: number) {
    try {
      return await this.postService.deletePost(postId);
    } catch (e) {
      throw e;
    }
  }
  @Delete()
  @ApiBearerAuth()
  async deleteAllPosts() {
    try {
      return await this.postService.deleteAllPosts();
    } catch (e) {
      throw e;
    }
  }
}
