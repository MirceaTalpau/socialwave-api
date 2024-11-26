import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  token: string;
}
