import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateDto } from './user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should return "Hello World!"', () => {
      const request: CreateDto = {
        username: 'annyeong',
        password: 'rootme',
        email: 'me@annyeong.me',
      };

      expect(userController.create(request)).toBe(1);
    });
  });
});
