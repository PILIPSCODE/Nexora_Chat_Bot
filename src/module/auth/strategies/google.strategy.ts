import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleService } from '../service/google.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private googleService: GoogleService,
  ) {
    super({
      clientID: String(configService.get('GOOGLE_CLIENT_ID')),
      clientSecret: String(configService.get('GOOGLE_CLIENT_SECRET')),
      callbackURL: 'http://localhost:8080/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = await this.googleService.validateUser({
      firstName: profile.name?.givenName ?? '',
      lastName: profile.name?.familyName ?? '',
      picture: profile.photos?.[0]?.value ?? '',
      id: profile.id,
      provider: 'google',
      scope: ['email', 'profile'],
      email: profile.emails?.[0]?.value ?? '',
    });
    return user;
    // done(user || null);
  }
}
