import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from 'src/entities/user.entity';
import { LoginUserDto } from './dtos/login-user.dto';
import { Public } from './auth.guard';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  @UseInterceptors(AnyFilesInterceptor())
  async registerUser(
    @Body() user: CreateUserDto,
    @UploadedFiles() file: Express.Multer.File, // This is to capture the uploaded files
  ): Promise<User> {
    if (file) {
      user.profilePicture = file[0]; // Assign the filename to the user object
    }
    return this.authService.registerUser(user);
  }
  @Post('login')
  async loginUser(@Body() user: LoginUserDto) {
    return this.authService.loginUser(user);
  }
  @Post('resend-confirmation')
  async resendConfirmationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }
  @Post('confirm-email')
  async confirmEmail(@Body() payload: VerifyEmailDto) {
    return this.authService.confirmEmail(payload);
  }
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }
  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }
}
