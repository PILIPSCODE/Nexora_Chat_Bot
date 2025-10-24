import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../service/jwt.service';

@Injectable()
export class CredentialGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const token: string = req.headers['accessToken'];

    if (!token) throw new UnauthorizedException('Unauthorized');

    try {
      const isValid = this.jwtService.verificationToken(token);

      if (isValid) {
        return true;
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }

    return true;
  }
}
