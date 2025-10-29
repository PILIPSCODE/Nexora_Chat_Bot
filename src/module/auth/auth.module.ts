import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtService } from './service/jwt.service';

import { FacebookStrategy } from './strategies/facebook.strategy';
import { FacebookService } from './service/facebook.service';
import { GoogleService } from './service/google.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailService } from './service/email.service';
import { CredentialStrategy } from './strategies/credential.strategy';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [IntegrationsModule],
  controllers: [AuthController],
  providers: [
    JwtService,
    FacebookStrategy,
    FacebookService,
    GoogleService,
    GoogleStrategy,
    EmailService,
    CredentialStrategy,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/*');
  }
}
