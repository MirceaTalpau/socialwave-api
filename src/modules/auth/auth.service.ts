import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';
import 'dotenv/config';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { FileUploadService } from '../fileupload/fileupload.service';

@Injectable()
export class AuthService {
  db: any;
  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly fileUploadService: FileUploadService,
  ) {
    this.db = drizzle(process.env.DATABASE_URL!);
  }

  async registerUser(user: CreateUserDto): Promise<User> {
    try {
      user.password = await this.hashPassword(user.password);
      const verificationToken = uuidv4();
      user.verificationToken = verificationToken;
      user.createdAt = new Date();
      user.updatedAt = new Date();
      const { key, url } = await this.fileUploadService.uploadSingleFile({
        file: user.profilePicture,
        isPublic: true,
      });
      console.log('Key:', key);
      // Prepare data to match Drizzle schema
      const userToInsert = {
        ...user,
        birthdate:
          user.birthdate instanceof Date
            ? user.birthdate.toISOString().split('T')[0] // Format as 'YYYY-MM-DD'
            : user.birthdate, // Assume it's already a valid date string
        profilePicture: url,
      };
      const [newUser] = await this.db
        .insert(usersTable)
        .values(userToInsert)
        .returning();
      console.log('New User:', newUser[0]);
      await this.emailService.sendConfirmationEmail(
        newUser.userId.toString(),
        verificationToken,
        newUser.email,
      );
      return {
        ...newUser[0],
        birthdate: new Date(newUser.birthdate),
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new UnauthorizedException('Email already exists');
      }
      console.error(error);
      throw error;
    }
  }

  async resendEmailConfirmation(email: string) {
    try {
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      if (!userFound[0]) {
        throw new UnauthorizedException('User not found');
      }
      if (userFound[0].isVerified) {
        throw new UnauthorizedException('Email already verified');
      }
      // await this.emailService.sendConfirmationEmail(
      //   userFound[0].userId.toString(),
      //   userFound[0].verificationToken,
      //   userFound[0].email,
      // );
      return {
        message: 'Verification email sent',
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async loginUser(user: LoginUserDto) {
    try {
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, user.email));
      if (!userFound[0]) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!userFound[0].isActivated) {
        throw new UnauthorizedException('Email not verified');
      }
      const isPasswordValid = await bcrypt.compare(
        user.password,
        userFound[0].password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { sub: userFound[0].userId, email: userFound[0].email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      if (!userFound[0]) {
        throw new UnauthorizedException('User not found');
      }
      if (userFound[0].isVerified) {
        throw new UnauthorizedException('Email already verified');
      }
      await this.emailService.sendConfirmationEmail(
        userFound[0].userId.toString(),
        userFound[0].verificationToken,
        userFound[0].email,
      );
      console.log(
        `Verification email sent to ${email} for user ${userFound[0].userId} with token ${userFound[0].verificationToken}`,
      );
      console.log(
        `Verification link: localhost:3000/confirm?id=${userFound[0].userId}&token=${userFound[0].verificationToken}`,
      );
      return {
        message: 'Verification email sent',
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async confirmEmail(payload: VerifyEmailDto) {
    try {
      console.log('Payload:', payload);

      // Find the user
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, payload.id));

      if (!userFound[0]) {
        throw new UnauthorizedException('User not found');
      }

      if (userFound[0].isVerified) {
        throw new UnauthorizedException('Email already verified');
      }

      if (userFound[0].verificationToken !== payload.token) {
        throw new UnauthorizedException('Invalid token');
      }

      // const result = await this.db
      //   .update(usersTable)
      //   .set({ isVerified: true })
      //   .where(eq(usersTable.userId, userFound[0].userId));
      const rawResult = await this.db.execute(
        sql`UPDATE users SET "isActivated" = true WHERE "userId" = ${userFound[0].userId}`,
      );
      console.log('Raw result:', rawResult);

      return {
        message: 'Email verified',
      };
    } catch (error) {
      console.error('Error in confirmEmail:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      console.log('User found:', userFound);
      if (!userFound[0]) {
        throw new UnauthorizedException('User not found');
      }
      const resetToken = uuidv4();
      await this.db
        .update(usersTable)
        .set({ resetToken })
        .where(eq(usersTable.userId, userFound[0].userId));
      await this.emailService.sendPasswordResetEmail(
        resetToken,
        userFound[0].email,
        userFound[0].userId,
      );
      return {
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const userFound = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.resetToken, payload.token));
      if (!userFound[0]) {
        throw new UnauthorizedException('Invalid token');
      }
      const hashedPassword = await this.hashPassword(payload.password);
      await this.db
        .update(usersTable)
        .set({ password: hashedPassword, resetToken: null })
        .where(eq(usersTable.userId, userFound[0].userId));
      return {
        message: 'Password reset successful',
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }
}
