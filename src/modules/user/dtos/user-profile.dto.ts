import { ApiProperty } from '@nestjs/swagger';
import { FeedResponseDto } from 'src/modules/feed/dtos/FeedResponse.dto';
import { FollowResponseDto } from 'src/modules/follow/dtos/follow-response.dto';

export class UserProfileDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  bio: string;
  @ApiProperty()
  profilePicture: string;
  @ApiProperty()
  coverPicture: string;
  @ApiProperty()
  birthdate: Date;
  @ApiProperty()
  posts: FeedResponseDto[];
  @ApiProperty()
  followers: FollowResponseDto[];
  @ApiProperty()
  following: FollowResponseDto[];
}
