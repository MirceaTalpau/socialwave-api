import { IsString, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  text: string;

  @IsBoolean()
  read: boolean;

  @IsNumber()
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  @IsString()
  type: string;

  @IsObject()
  details?: Record<string, any>;
}
