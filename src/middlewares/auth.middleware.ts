import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly JWT_SECRET = process.env.JWT_SECRET; // Replace with your real secret key

  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        sub: string;
        email: string;
      };
      req.user = decoded.sub; // Attach userId to the request object
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
