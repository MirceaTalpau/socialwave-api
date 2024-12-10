import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiBearerAuth()
  @Get()
  async getFeed(@Req() req, @Param() payload: { page?: number } = { page: 1 }) {
    const user = req.user;
    const feed = await this.feedService.getFeed(user, payload.page);
    return feed;
  }
}
