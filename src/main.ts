import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationFilter } from './filter/validation.filter';
import { HttpFilter } from './filter/http.filter';
import { JwtFilter } from './filter/jwt.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new HttpFilter());
  app.useGlobalFilters(new JwtFilter());

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
