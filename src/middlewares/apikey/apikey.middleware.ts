import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApikeyMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const apikey = req.headers['api-key'];

    if (apikey != this.configService.get('API_KEY'))
      return res
        .status(403)
        .json({ message: 'Please provide a valid api-key!!' });

    next();
  }
}
