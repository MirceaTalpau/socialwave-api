import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiBearerAuth()
  @Get('')
  async getFeed(@Req() req, @Query() payload: { page?: number } = { page: 1 }) {
    console.log('pg:', payload.page);
    const user = req.user;
    const feed = await this.feedService.getFeed(user, payload.page);
    console.log('after fetch');
    return feed;
  }
}
