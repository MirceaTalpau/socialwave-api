import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty()
  user1Id: number;
  user2Id?: number;
}
