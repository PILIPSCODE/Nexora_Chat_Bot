import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CredentialStrategy } from './strategies/credential.strategy';
import { JwtService } from './service/jwt.service';
import { EmailService } from './service/email.service';
import { CredentialGuard } from './guard/credential.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleService } from './service/google.service';

@Module({
  controllers: [AuthController],
  providers: [
    CredentialStrategy,
    JwtService,
    CredentialStrategy,
    EmailService,
    GoogleService,
    GoogleStrategy,
    CredentialGuard,
  ],
  exports: [CredentialGuard],
})
export class AuthModule {}
