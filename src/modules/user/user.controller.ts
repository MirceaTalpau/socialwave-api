import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth()
  @Get()
  async findOne(@Req() req) {
    const user = req.user;
    console.log(user);
    return await this.userService.findOne(user);
  }
  @ApiBearerAuth()
  @Get('search')
  async searchUser(@Req() req) {
    console.log(req.query.name);
    const searchParam = req.query.name;
    return await this.userService.searchUser(searchParam);
  }
}
