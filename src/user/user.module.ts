import { User } from './user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import JwtConfig from '../../config/jwt.config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register(JwtConfig)],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
