import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationFilter } from './filter/validation.filter';
import { HttpFilter } from './filter/http.filter';
import { ConfigService } from '@nestjs/config';
import { JwtFilter } from './filter/jwt.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new HttpFilter());
  app.useGlobalFilters(new JwtFilter());

  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('PORT');

  await app.listen(PORT ?? 8080);
}
bootstrap();
