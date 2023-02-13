import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Err, Ok } from '@sniptt/monads/build';
import { UnprocessableEntityError } from '../../src/share/errors';
import { UserController } from '../../src/user/user.controller';
import {
  UserCreateDto,
  UserLogInDto,
  UserResponseDto,
  UserUpdateDto,
} from '../../src/user/user.dto';
import { UserService } from '../../src/user/user.service';

const mockService = {
  login: jest.fn((entity) => Ok(entity)),
  create: jest.fn((entity) => Ok(entity)),
  findOneById: jest.fn((entity) => Ok(entity)),
  updateById: jest.fn((entity) => Ok(entity)),
};

describe('user controller', () => {
  let app: INestApplication;
  let userController: UserController;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    userController = app.get(UserController);
    userService = app.get(UserService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should throw error when service returns Err', async () => {
      const request = {
        email: 'email@example.com',
        password: 'password',
      };
      const error = new UnprocessableEntityError({ field: ['why'] });

      jest.spyOn(userService, 'login').mockResolvedValueOnce(Err(error));

      await expect(async () => {
        await userController.authenticate(request);
      }).rejects.toThrow(error);
    });

    it('should return a user response object', async () => {
      const request: UserLogInDto = {
        email: 'email@example.com',
        password: 'password',
      };

      const response = await userController.authenticate(request);

      expect(response).toBeInstanceOf(Object);
      expect(response.user).toBeInstanceOf(Object);
      expect(response.user.email).toStrictEqual(request.email);
    });
  });

  describe('registrate', () => {
    it('should throw error when service returns Err', async () => {
      const request: UserCreateDto = {
        email: 'email@example.com',
        password: 'password',
        username: 'username',
      };

      const error = new UnprocessableEntityError({ field: ['why'] });

      jest.spyOn(userService, 'create').mockResolvedValueOnce(Err(error));

      await expect(async () => {
        await userController.registrate(request);
      }).rejects.toThrow(error);
    });

    it('should return a user response object', async () => {
      const userCreateSpy = jest.spyOn(userService, 'create');

      const request: UserCreateDto = {
        email: 'email@example.com',
        password: 'password',
        username: 'username',
      };

      const result = await userController.registrate(request);

      expect(userCreateSpy).toBeCalled();
      expect(result).toBeInstanceOf(Object);
      expect(result.user).toBeInstanceOf(Object);
      expect(result.user.username).toStrictEqual(request.username);
      expect(result.user.email).toStrictEqual(request.email);
    });
  });

  describe('getCurrent', () => {
    it('should return a user response object', async () => {
      const mockEmail = 'mail@mail.com';
      const serviceSpy = jest
        .spyOn(userService, 'findOneById')
        .mockImplementationOnce(async (_id) =>
          Ok({ email: mockEmail } as UserResponseDto),
        );

      const request: number = 1;

      const result = await userController.getCurrent(request);

      expect(serviceSpy).toBeCalled();
      expect(result).toBeInstanceOf(Object);
      expect(result.user).toBeInstanceOf(Object);
      expect(result.user.email).toStrictEqual(mockEmail);
    });

    it('should throw error when service returns Err', async () => {
      const request: number = 1;
      const error = new UnprocessableEntityError({ field: ['why'] });
      const serviceSpy = jest
        .spyOn(userService, 'findOneById')
        .mockResolvedValueOnce(Err(error));

      await expect(async () => {
        await userController.getCurrent(request);
      }).rejects.toThrow(error);
      expect(serviceSpy).toBeCalled();
    });

    it('should throw error when undefined is given', async () => {
      const request: number = undefined;
      const error = new UnprocessableEntityError({ field: ['why'] });
      const serviceSpy = jest.spyOn(userService, 'findOneById');

      await expect(async () => {
        await userController.getCurrent(request);
      }).rejects.toThrow(error);
      expect(serviceSpy).toBeCalledTimes(0);
    });
  });

  describe('update', () => {
    it('should return a user response object', async () => {
      const updateParams: UserUpdateDto = { username: 'newUsername' };
      const userId = 1;
      const serviceSpy = jest
        .spyOn(userService, 'updateById')
        .mockImplementationOnce(async (_id: number, param: UserUpdateDto) =>
          Ok({ username: param.username } as UserResponseDto),
        );

      const result = await userController.update(userId, updateParams);

      expect(serviceSpy).toBeCalled();
      expect(result).toBeInstanceOf(Object);
      expect(result.user).toBeInstanceOf(Object);
      expect(result.user.username).toEqual(updateParams.username);
    });

    it('should throw error when service returns Err', async () => {
      const updateParams: UserUpdateDto = { username: 'newUsername' };
      const userId: number = 1;
      const error = new UnprocessableEntityError({ field: ['why'] });
      const serviceSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValueOnce(Err(error));

      await expect(async () => {
        await userController.update(userId, updateParams);
      }).rejects.toThrow(error);
      expect(serviceSpy).toBeCalled();
    });

    it('should throw error when undefined was given as id', async () => {
      const updateParams: UserUpdateDto = { username: 'newUsername' };
      const userId: number = undefined;
      const serviceSpy = jest.spyOn(userService, 'updateById');

      await expect(async () => {
        await userController.update(userId, updateParams);
      }).rejects.toThrowError(UnprocessableEntityError);
      expect(serviceSpy).toBeCalledTimes(0);
    });
  });
});
