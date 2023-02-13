import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { Repository } from 'typeorm';
import { UnprocessableEntityError } from '../../src/share/errors';
import {
  UserCreateDto,
  UserLogInDto,
  UserUpdateDto,
} from '../../src/user/user.dto';
import { User } from '../../src/user/user.entity';
import { UserService } from '../../src/user/user.service';
import { repositoryMockFactory } from '../utils';

const jwtMock = {
  signAsync: jest.fn().mockResolvedValue('hashed'),
};

describe('user service', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    userService = app.get(UserService);
    userRepo = app.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call `repo.save` and return UserResponseDto', async () => {
      jest.spyOn(userRepo, 'findOne').mockImplementationOnce(async () => null);

      const spySave = jest.spyOn(userRepo, 'save');
      const requestDto: UserCreateDto = {
        username: 'example',
        email: 'example@example.com',
        password: 'password',
      };

      const result = await userService.create(requestDto);

      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toBeInstanceOf(Object);
      expect(result.unwrap()).toHaveProperty('username', requestDto.username);
      expect(result.unwrap()).toHaveProperty('email', requestDto.email);
      expect(result.unwrap()).toHaveProperty('bio');
      expect(result.unwrap()).toHaveProperty('token');
      expect(result.unwrap()).toHaveProperty('image');
      expect(spySave).toBeCalled();
    });

    it('should save username and email as lowercase', async () => {
      jest.spyOn(userRepo, 'findOne').mockImplementationOnce(async () => null);

      const requestDto: UserCreateDto = {
        username: 'ExAmPlE',
        email: 'ExAmPlE@Edr.cof',
        password: 'password',
      };

      const result = await userService.create(requestDto);

      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toBeInstanceOf(Object);
      expect(result.unwrap()).toHaveProperty(
        'username',
        requestDto.username.toLowerCase(),
      );
      expect(result.unwrap()).toHaveProperty(
        'email',
        requestDto.email.toLowerCase(),
      );
      expect(result.unwrap()).toHaveProperty('bio');
      expect(result.unwrap()).toHaveProperty('token');
      expect(result.unwrap()).toHaveProperty('image');
    });

    it('should return Err if either the username or email is already taken', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockImplementation(async () => new User());
      const spySave = jest.spyOn(userRepo, 'save');

      const requestDto: UserCreateDto = {
        username: 'example',
        email: 'example@example.com',
        password: 'password',
      };

      const result = await userService.create(requestDto);

      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBeInstanceOf(UnprocessableEntityError);
      expect(spySave).toBeCalledTimes(0);
    });

    it.todo('should hash password before create');
  });

  describe('login', () => {
    it('should call `repo.findOneBy`, and success verifying', async () => {
      const requestDto: UserLogInDto = {
        email: 'example',
        password: 'password',
      };

      const mockFindOneBy = jest
        .spyOn(userRepo, 'findOneBy')
        .mockImplementationOnce(async () => {
          const user = new User();
          user.hashedPassword = await hash(requestDto.password);
          return user;
        });

      const response = await userService.login(requestDto);

      expect(response.isOk()).toBeTruthy();
      expect(mockFindOneBy).toBeCalled();
    });

    it('should not allow email does not exist', async () => {
      jest
        .spyOn(userRepo, 'findOneBy')
        .mockImplementationOnce(async () => null);

      const requestDto: UserLogInDto = {
        email: 'example',
        password: 'password',
      };

      const response = await userService.login(requestDto);

      expect(response.isErr()).toBeTruthy();
      expect(response.unwrapErr()).toBeInstanceOf(UnprocessableEntityError);
    });

    it('should not allow wrong password', async () => {
      const requestDto: UserLogInDto = {
        email: 'example',
        password: 'password',
      };

      jest.spyOn(userRepo, 'findOneBy').mockImplementationOnce(async () => {
        const user = new User();
        user.hashedPassword = await hash('invalid');
        return user;
      });

      const response = await userService.login(requestDto);

      expect(response.isErr()).toBeTruthy();
      expect(response.unwrapErr()).toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('findOneById', () => {
    it('should call `findOneBy` on service', async () => {
      const request: number = 1;

      const findOneBySpy = jest.spyOn(userRepo, 'findOneBy');

      const result = await userService.findOneById(request);

      expect(findOneBySpy).toBeCalled();
      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toHaveProperty('username');
      expect(result.unwrap()).toHaveProperty('email');
      expect(result.unwrap()).toHaveProperty('bio');
      expect(result.unwrap()).toHaveProperty('image');
      expect(result.unwrap()).toHaveProperty('token');
    });

    it('should return Err if user not found with given id', async () => {
      const findOneBySpy = jest
        .spyOn(userRepo, 'findOneBy')
        .mockResolvedValueOnce(null);

      const request: number = 1;

      const result = await userService.findOneById(request);

      expect(findOneBySpy).toBeCalled();
      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('updateById', () => {
    it('should call `update` with given params', async () => {
      const updateSpy = jest.spyOn(userRepo, 'update');

      const userId = 1;
      const params: UserUpdateDto = {
        username: 'something',
      };

      const result = await userService.updateById(userId, params);

      expect(updateSpy).toBeCalledWith(userId, params);
      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toHaveProperty('username');
      expect(result.unwrap()).toHaveProperty('email');
      expect(result.unwrap()).toHaveProperty('bio');
      expect(result.unwrap()).toHaveProperty('image');
      expect(result.unwrap()).toHaveProperty('token');
    });

    it('should return Err if user not found with given id', async () => {
      const updateSpy = jest.spyOn(userRepo, 'update');
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(null);

      const userId = 1;
      const params: UserUpdateDto = {
        username: 'something',
      };

      const result = await userService.updateById(userId, params);

      expect(updateSpy).toBeCalledTimes(0);
      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBeInstanceOf(UnprocessableEntityError);
    });
  });
});
