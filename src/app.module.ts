import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonModule } from './module/common/common.module';
import { BotModule } from './module/bot/bot.module';
import { IntegrationsModule } from './module/integrations/integrations.module';
import { AuthModule } from './module/auth/auth.module';
import { LlmModule } from './module/llm/llm.module';
import { PromptModule } from './module/prompt/prompt.module';
import { MessageModule } from './module/message/message.module';
import { UserModule } from './module/user/user.module';
import { ApikeyMiddleware } from './middlewares/apikey/apikey.middleware';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    CommonModule,
    BotModule,
    IntegrationsModule,
    AuthModule,
    LlmModule,
    PromptModule,
    MessageModule,
    UserModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(ApikeyMiddleware).forRoutes('*');
//   }
// }
