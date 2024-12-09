import { Body, Controller, Delete, Post, Put, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/CreateComment.dto';
import { UpdateCommentDto } from './dtos/UpdateComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(@Req() req, @Body() comment: CreateCommentDto) {
    const user = req.user;
    console.log(user);
    comment.userId = user;
    return await this.commentService.createComment(comment);
  }

  @Put()
  async updateComment(@Req() req, @Body() comment: UpdateCommentDto) {
    const user = req.user;
    comment.userId = user;
    return await this.commentService.updateComment(comment);
  }

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
