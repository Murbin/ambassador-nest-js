import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4300', 'http://localhost:5000'],
    credentials: true
  })
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', { infer: true }) || 3000;
  await app.listen(port);
}
bootstrap();
