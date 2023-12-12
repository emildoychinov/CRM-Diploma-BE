import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';

const expressApp = require('express')();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { cors: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('DEV_PORT');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(port as number);
}
bootstrap();