import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  createPost(@Req() req, @Body() createPostDto: CreatePostDto) {
    try {
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
