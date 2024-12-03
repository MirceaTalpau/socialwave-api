import { IsNotEmpty, IsNumber } from 'class-validator';

export class RequestFollowDto {
  @IsNumber()
  @IsNotEmpty()
  followerId: number;

  @IsNumber()
  @IsNotEmpty()
  followeeId: number;
}
