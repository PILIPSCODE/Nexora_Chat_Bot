import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

@Catch(JsonWebTokenError)
export class JwtFilter implements ExceptionFilter<JsonWebTokenError> {
  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    response.status(400).json({
      status: '400',
      error: 'refreshToken is invalid!!',
    });
  }
}
