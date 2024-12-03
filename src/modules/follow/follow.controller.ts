import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { RequestFollowDto } from './dtos/request-follow.dto';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Get()
  async getFollowRequests(@Req() req) {
    const user = req.user;
    return await this.followService.getFollowRequests(user);
  }
  @Post('request')
  async requestFollow(@Body() followRequest: RequestFollowDto) {
    return await this.followService.requestFollow(followRequest);
  }

  @Post('accept')
  async acceptFollow(@Body() followRequest: RequestFollowDto) {
    return await this.followService.acceptFollow(followRequest);
  }

  @Post('reject')
  async rejectFollow(@Body() followRequest: RequestFollowDto) {
    return await this.followService.rejectFollow(followRequest);
  }
}
