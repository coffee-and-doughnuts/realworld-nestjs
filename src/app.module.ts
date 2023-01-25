import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import TypeOrmConfig from '../config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig(process.env.NODE_ENV)),
    UserModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
