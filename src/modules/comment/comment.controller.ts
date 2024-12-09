import { Body, Controller, Delete, Post, Put, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/CreateComment.dto';
import { UpdateCommentDto } from './dtos/UpdateComment.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @ApiBearerAuth()
  @Post()
  async createComment(@Req() req, @Body() comment: CreateCommentDto) {
    const user = req.user;
    comment.userId = user;
    return await this.commentService.createComment(comment);
  }
  @ApiBearerAuth()
  @Put()
  async updateComment(@Req() req, @Body() comment: UpdateCommentDto) {
    const user = req.user;
    comment.userId = user;
    return await this.commentService.updateComment(comment);
  }
  @ApiBearerAuth()
  @Delete()
  async deleteComment(@Req() req, @Body() comment: { commentId: number }) {
    const user = req.user;
    return await this.commentService.deleteComment(comment.commentId, user);
  }

  //   @Get()
  //   async getCommentsByPostId(@Body() post: { postId: number }) {
  //     return await this.commentService.getCommentsByPostId(post.postId);
  //   }
}
