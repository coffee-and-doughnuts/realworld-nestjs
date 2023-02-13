import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import TypeOrmConfig from '../config/typeorm.config';
import { ValidatorPipe } from './app.pipe';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig(process.env.NODE_ENV)),
    UserModule,
    ArticleModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidatorPipe,
    },
  ],
})
export class AppModule {}
