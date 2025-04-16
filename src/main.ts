import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Habilita conversão automática
      transformOptions: {
        enableImplicitConversion: true, // Importante para tipos
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  await app.listen(3050);
}
bootstrap();