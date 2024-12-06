import { Controller, Get, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth()
  @Get()
  async findOne(@Req() req) {
    const user = req.user;
    return await this.userService.findOne(user);
  }
  @ApiBearerAuth()
  @Get('id/:id')
  async findOneById(@Req() req, @Param() payload: { id: number }) {
    const userId = req.user;
    return await this.userService.findOne(userId, payload.id);
  }
  @ApiBearerAuth()
  @Get('search')
  async searchUser(@Req() req) {
    const searchParam = req.query.name;
    const user = req.user;
    return await this.userService.searchUser(searchParam, user);
  }
}
