import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { RequestFollowDto } from './dtos/request-follow.dto';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Get('follow-requests')
  async getFollowRequests(@Req() req) {
    const user = req.user;
    return await this.followService.getFollowRequests(user);
  }

  // @Get('followers')
  // async getFollowers(@Req() req) {
  //   const user = req.user;
  //   return await this.followService.getFollowers(user);
  // }

  // @Get('following')
  // async getFollowing(@Req() req) {
  //   const user = req.user;
  //   return await this.followService.getFollowing(user);
  // }

  @Get(':userId')
  async getFollowStatus(@Req() req, @Param() payload: { userId: number }) {
    const user = req.user;
    const followRequest = new RequestFollowDto();
    followRequest.followerId = user;
    followRequest.followeeId = payload.userId;
    return await this.followService.getFollowStatus(followRequest);
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
  @Delete('delete')
  async deleteFollowRequest(
    @Req() req,
    @Body() followee: { followee: number },
  ) {
    const followRequest = new RequestFollowDto();
    const user = req.user;
    followRequest.followerId = followee.followee;
    followRequest.followeeId = user;
    return await this.followService.deleteFollowRequest(followRequest);
  }
}
