import { HttpException, HttpStatus  } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { ValidatorPipe } from './app.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidatorPipe({
      transform: true
    })
  )

  await app.listen(3000);
}
bootstrap();
