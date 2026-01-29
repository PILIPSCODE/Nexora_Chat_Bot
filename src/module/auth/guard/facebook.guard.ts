import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class FacebookOauthGuard extends AuthGuard('facebook') {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const userId = req.query.userId;
    if (userId) {
      req.query.callbackURL = `${process.env.FACEBOOK_CALLBACK_URL}?userId=${userId}`;
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const userId = req.query.userId;

    return {
      callbackURL: `${process.env.FACEBOOK_CALLBACK_URL}?userId=${userId}`,
    };
  }
}
