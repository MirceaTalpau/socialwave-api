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
  async requestFollow(@Req() req, @Body() followee: { followee: number }) {
    const user = req.user;
    const followRequest = new RequestFollowDto();
    console.log(followee);
    followRequest.followerId = user;
    followRequest.followeeId = followee.followee;
    console.log(followRequest);
    return await this.followService.requestFollow(followRequest);
  }

  @Post('accept')
  async acceptFollow(@Req() req, @Body() followee: { followee: number }) {
    const followRequest = new RequestFollowDto();
    const user = req.user;
    followRequest.followerId = followee.followee;
    followRequest.followeeId = user;
    return await this.followService.acceptFollow(followRequest);
  }

  @Post('reject')
  async rejectFollow(@Req() req, @Body() followee: { followee: number }) {
    const followRequest = new RequestFollowDto();
    const user = req.user;
    followRequest.followerId = followee.followee;
    followRequest.followeeId = user;
    return await this.followService.rejectFollow(followRequest);
  }
  @Post('unfollow')
  async unfollow(@Req() req, @Body() followee: { followee: number }) {
    const followRequest = new RequestFollowDto();
    const user = req.user;
    followRequest.followerId = user;
    followRequest.followeeId = followee.followee;
    return await this.followService.unfollow(followRequest);
  }
}
