import { Controller, Param, Post, Req } from '@nestjs/common';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':postId')
  async likePost(@Req() req, @Param() payload: { postId: number }) {
    const user = req.user;
    return await this.likeService.likePost(user, payload.postId);
  }

  @Post('unlike/:postId')
  async unlikePost(@Req() req, @Param() payload: { postId: number }) {
    const user = req.user;
    return await this.likeService.unlikePost(user, payload.postId);
  }
}
