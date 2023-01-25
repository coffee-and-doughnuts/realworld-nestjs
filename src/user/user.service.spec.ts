import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateDto } from './user.dto';

describe('UserController', () => {
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  describe('create', () => {
    it('', () => {});
  });

  describe('login', () => {});
});
