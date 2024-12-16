import { IsString, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsBoolean()
  read: boolean;

  @IsNumber()
  userId: number;

  @IsString()
  type: string;

  @IsObject()
  details?: Record<string, any>;
}
