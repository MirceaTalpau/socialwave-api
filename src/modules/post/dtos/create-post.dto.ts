import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  userId?: number;
  @ApiProperty()
  @IsNotEmpty()
  description: string;
  @ApiProperty()
  @IsNotEmpty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  images?: Express.Multer.File[];

  @ApiProperty({ type: [String], description: 'Array of video file URLs' })
  videos?: Express.Multer.File[];
}
