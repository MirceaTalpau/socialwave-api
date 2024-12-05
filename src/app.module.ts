import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthController } from './modules/auth/auth.controller';
import 'dotenv/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './modules/post/post.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { FileuploadModule } from './modules/fileupload/fileupload.module';
import { UserModule } from './modules/user/user.module';
import { FollowModule } from './modules/follow/follow.module';
import { FeedController } from './modules/feed/feed.controller';
import { FeedModule } from './modules/feed/feed.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT),
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PASS,
    //   database: process.env.DB_NAME,
    //   synchronize: false,
    //   entities: [__dirname + '/dist/*.entity{.ts,.js}'],
    //   migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
    // }),
    EmailModule,
    PostModule,
    FileuploadModule,
    UserModule,
    FollowModule,
    FeedModule,
  ],
  controllers: [AuthController, FeedController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth', method: RequestMethod.ALL }, // Exclude all routes under /auth
        { path: 'auth/(.*)', method: RequestMethod.ALL }, // To exclude dynamic sub-routes like /auth/login
      )
      .forRoutes('*'); // Apply middleware to all other routes
  }
}
