import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from 'src/email/email.service';
import { FileUploadService } from '../fileupload/fileupload.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, EmailService, FileUploadService],
  exports: [AuthService],
})
export class AuthModule {}
