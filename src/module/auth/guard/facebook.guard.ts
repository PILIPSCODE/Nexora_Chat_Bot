import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class FacebookOauthGuard extends AuthGuard('facebook') {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const userId = req.query.userId;
    if (userId) {
      // dynamically modify callback URL
      req.query.callbackURL = `http://localhost:8080/api/auth/facebook/redirect?userId=${userId}`;
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const userId = req.query.userId;

    return {
      callbackURL: `http://localhost:8080/api/auth/facebook/redirect?userId=${userId}`,
    };
  }
}
