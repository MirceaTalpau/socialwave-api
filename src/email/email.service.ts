import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  private emailTemplate(id: string, token: string): string {
    const confirmationUrl = `http://localhost:3000/auth/confirm?id=${id}&token=${token}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://via.placeholder.com/100x100?text=SocialWave" alt="SocialWave Logo" style="max-width: 100px; border-radius: 50%;">
          <h1 style="color: #0073e6; font-size: 24px; margin: 10px 0;">Welcome to SocialWave!</h1>
        </div>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          Thank you for joining <strong>SocialWave</strong>! To start connecting and sharing, please confirm your email address by clicking the button below.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #0073e6; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">Confirm Email</a>
        </div>
        <p style="font-size: 16px; color: #333;">If you didn’t sign up for SocialWave, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
          &copy; 2024 SocialWave. All rights reserved.<br>
          Visit us at <a href="https://socialwave.example.com" style="color: #0073e6; text-decoration: none;">socialwave.example.com</a>
        </p>
      </div>
    `;
  }
  private passwordResetTemplate(token: string, id: number): string {
    const resetUrl = `http://localhost:3000/auth/reset-password?id=${id}&token=${token}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://via.placeholder.com/100x100?text=SocialWave" alt="SocialWave Logo" style="max-width: 100px; border-radius: 50%;">
          <h1 style="color: #0073e6; font-size: 24px; margin: 10px 0;">Reset Your Password</h1>
        </div>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          We received a request to reset your SocialWave account password. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0073e6; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 16px; color: #333;">If you didn’t request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
          &copy; 2024 SocialWave. All rights reserved.<br>
          Visit us at <a href="https://socialwave.example.com" style="color: #0073e6; text-decoration: none;">socialwave.example.com</a>
        </p>
      </div>
    `;
  }

  sendPasswordResetEmail(
    token: string,
    recipientEmail: string,
    userId: number,
  ): void {
    const emailHtml = this.passwordResetTemplate(token, userId);
    this.mailService.sendMail({
      to: recipientEmail,
      subject: 'Reset Your Password',
      html: emailHtml,
      from: 'SocialWave <>',
    });
  }

  sendConfirmationEmail(
    id: string,
    token: string,
    recipientEmail: string,
  ): void {
    const emailHtml = this.emailTemplate(id, token);
    this.mailService.sendMail({
      to: recipientEmail,
      subject: 'Welcome to SocialWave! Confirm Your Email',
      html: emailHtml,
      from: 'SocialWave <>',
    });
  }
}
