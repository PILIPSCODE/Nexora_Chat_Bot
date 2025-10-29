import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from 'src/module/auth/service/jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) throw new HttpException('Unauthorized!!', 401);

    try {
      const isValid = this.jwtService.verificationToken(String(token));

      if (isValid) {
        return next();
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('Access token expired!!', 400);
      }
      throw new HttpException('Invalid access token!!', 400);
    }
  }
}
