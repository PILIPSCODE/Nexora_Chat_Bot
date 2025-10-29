import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationFilter } from './filter/validation.filter';
import { HttpFilter } from './filter/http.filter';
import { JwtFilter } from './filter/jwt.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new HttpFilter());
  app.useGlobalFilters(new JwtFilter());

  await app.listen(8080);
}
bootstrap();
