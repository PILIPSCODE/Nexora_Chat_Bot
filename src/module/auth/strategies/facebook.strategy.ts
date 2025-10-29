import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { FacebookService } from '../service/facebook.service';
import { FacebookApiService } from 'src/module/integrations/whatsaap/facebookApi.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private facebookAPiService: FacebookApiService,
    private facebookService: FacebookService,
  ) {
    super({
      clientID: String(configService.get('FACEBOOK_CLIENT_ID')),
      clientSecret: String(configService.get('FACEBOOK_CLIENT_SECRET')),
      callbackURL: 'http://localhost:8080/auth/facebook/redirect',
      scope: [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management',
      ],
      profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
      passReqToCallback: true,
    });
  }
  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    try {
      const userId = req.query.userId;
      const bizRes = await this.facebookAPiService.getbussinesData(accessToken);

      const waba = await this.facebookAPiService.getWaBussinessAccount(
        accessToken,
        bizRes.id,
      );

      const user = {
        userId: userId,
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        accessToken: accessToken,
        picture: profile.photos?.[0].value,
        busineesId: bizRes.id,
        wabaId: waba.id,
      };
      if (user.userId === 'undefined') {
        const createAccount =
          await this.facebookService.validateUserAccount(user);
        return done(null, createAccount);
      } else {
        const data = await this.facebookService.validateUser(user);
        return done(null, data);
      }
    } catch (error) {
      console.error('OAuth validation error:', error.response?.data || error);
      done(error, null);
    }
  }
}
