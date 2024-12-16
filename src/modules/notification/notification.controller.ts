import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateNotificationDto } from './dtos/CreateNotification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiBearerAuth()
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.createNotification(data);
  }

  @Get()
  @ApiBearerAuth()
  async getNotifications(@Req() req) {
    const user = req.user;
    return this.notificationService.getNotifications(user);
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  async markAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(id);
  }
}
