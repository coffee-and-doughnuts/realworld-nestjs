import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  UserCreateDto,
  UserLogInDto,
  UserResponseDto,
  UserUpdateDto
} from 'src/user/user.dto';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/user/user.entity';

describe('User', () => {
  let app: INestApplication;
  let server;
  let datasource: DataSource;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    datasource = app.get(DataSource);
    userRepo = datasource.getRepository(User);
    await app.init();
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // clear database before test each case.
    await datasource.synchronize(true);
  });

  describe('Registration (POST /api/users)', () => {
    const mockRequest: UserCreateDto = {
      username: 'AnNyeong',
      email: 'example@example.com',
      password: 'rootme',
    };

    it('should create and return a new account', async () => {
      return request(server)
        .post('/users')
        .send({
          user: mockRequest,
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          const user = res.body.user;
          expect(user).toBeInstanceOf(Object);
          expect(user).toHaveProperty(
            'email',
            mockRequest.email.toLocaleLowerCase(),
          );
          expect(user).toHaveProperty(
            'username',
            mockRequest.username.toLocaleLowerCase(),
          );
          expect(user).toHaveProperty('token', expect.any(String));
          expect(user).toHaveProperty('bio', expect.any(String));
          expect(user).toHaveProperty('image', expect.any(String));
        });
    });

    it('should return errors when mandatory fields are missing', async () => {
      return request(server)
        .post('/users')
        .send({
          user: {},
        })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .expect((res) => {
          const errors = res.body.errors;

          expect(errors).toBeInstanceOf(Object);
          expect(errors).toHaveProperty('email', expect.any(Array));
          expect(errors).toHaveProperty('password', expect.any(Array));
          expect(errors).toHaveProperty('username', expect.any(Array));
        });
    });

    it('should return errors if the provided email is already registered', async () => {
      await request(server).post('/users').send({ user: mockRequest });

      return request(server)
        .post('/users')
        .send({ user: mockRequest })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .expect((res) => {
          const errors = res.body.errors;

          expect(errors).toBeInstanceOf(Object);
          expect(errors).toHaveProperty('email', expect.any(Array));
        });
    });
  });

  describe('Authenticate (POST /api/users/login)', () => {
    const mockRequest: UserLogInDto = {
      email: 'example@example.com',
      password: 'password',
    };
    let mockUser;

    beforeEach(async () => {
      await request(server)
        .post('/users')
        .send({
          user: {
            ...mockRequest,
            username: 'annyeong',
          },
        })
        .ok((res) => (mockUser = res.body.user));
    });

    it('should return the user with a valid token', async () => {
      return request(server)
        .post('/users/login')
        .send({ user: mockRequest })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          const user = res.body.user;

          expect(user).toBeDefined();
          expect(user).toHaveProperty('email', mockRequest.email);
          expect(user).toHaveProperty('username', expect.any(String));
          expect(user).toHaveProperty('bio', expect.any(String));
          expect(user).toHaveProperty('image', expect.any(String));
          expect(user).toHaveProperty('token', expect.any(String));
        });
    });

    it('should return errors when provided email and password combination is incorrect', async () => {
      return request(server)
        .post('/users/login')
        .send({
          user: {
            email: mockRequest.email,
            password: '',
          },
        })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .expect((res) => {
          const errors = res.body.errors;

          expect(errors).toBeDefined();
          expect(errors).toHaveProperty('email', expect.any(Array));
          expect(errors).toHaveProperty('password', expect.any(Array));
        });
    });

    it('should errors when either email or password is missing', async () => {
      return request(server)
        .post('/users/login')
        .send({ user: {} })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .expect((res) => {
          const errors = res.body.errors;

          expect(errors).toBeDefined();
          expect(errors).toHaveProperty('email', expect.any(Array));
          expect(errors).toHaveProperty('password', expect.any(Array));
        });
    });
  });

  describe('Get current user (GET /api/user)', () => {
    const mockRegistration: UserCreateDto = {
      email: 'example@example.com',
      password: 'password',
      username: 'annyeong',
    };
    let mockUser: UserResponseDto;

    beforeEach(async () => {
      await request(server)
        .post('/users')
        .send({
          user: mockRegistration,
        })
        .ok((res) => (mockUser = res.body.user));
    });

    it('should return a user with a valid token', async () => {
      return request(server)
        .get('/user')
        .send()
        .set({ Authorization: `Token ${mockUser.token}` })
        .expect(HttpStatus.OK)
        .expect((res) => {
          const user = res.body.user;
          expect(user).toBeDefined();
          expect(user).toHaveProperty('email', mockUser.email);
          expect(user).toHaveProperty('username', mockUser.username);
          expect(user).toHaveProperty('token');
        });
    });

    it('should return errors when a token is not provided', async () => {
      return request(server)
        .get('/user')
        .send()
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          const errors = res.body.errors;
          expect(errors).toBeDefined();
          expect(errors).toHaveProperty('authorize');
        });
    });

    it('should return errors when provided token is not verified', async () => {
      return request(server)
        .get('/user')
        .send()
        .set({ Authorization: `Token ${mockUser.token}aabbcc` })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Update user (PUT /api/user)', () => {
    const mockRegistration: UserCreateDto = {
      email: 'example@example.com',
      password: 'password',
      username: 'annyeong',
    };
    const changeReq: UserUpdateDto = {
      username: 'change',
      bio: 'some bio',
      image: 'image.png',
      email: 'mail@mail.mail',
      password: 'new-password',
    };
    let mockUser: UserResponseDto;

    beforeEach(async () => {
      await request(server)
        .post('/users')
        .send({
          user: mockRegistration,
        })
        .ok((res) => (mockUser = res.body.user));
    });

    it('should return updated user', async () => {
      return request(server)
        .put('/user')
        .send({ user: changeReq })
        .set({ Authorization: `Token ${mockUser.token}` })
        .expect(HttpStatus.OK)
        .expect(({ body: { user } }) => {
          expect(user).toBeDefined();
          expect(user).toHaveProperty('username', changeReq.username);
          expect(user).toHaveProperty('bio', changeReq.bio);
          expect(user).toHaveProperty('image', changeReq.image);
          expect(user).toHaveProperty('email', changeReq.email);
          expect(user.password).toBeUndefined();
        });
    });

    it('should able to re-login with updated password', async () => {
      await request(server)
        .put('/user')
        .send({ user: changeReq })
        .set({ Authorization: `Token ${mockUser.token}` })
        .expect(HttpStatus.OK)
        .expect(({ body: { user } }) => {
          expect(user).toBeDefined();
          expect(user).toHaveProperty('email', changeReq.email);
        });

      return request(server)
        .post('/users/login')
        .send({ user: changeReq })
        .expect(HttpStatus.CREATED);
    });

    it('should return errors when a token is not given', async () => {
      return request(server)
        .put('/user')
        .send({ user: changeReq })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(({ body: { errors } }) => {
          expect(errors).toBeDefined();
          expect(errors).toHaveProperty('authorize', expect.any(Array));
        });
    });

    it('should return errors when the provided token is not verfied', async () => {
      return request(server)
        .put('/user')
        .send({ user: changeReq })
        .set({ Authorization: `Token wrongtoken` })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(({ body: { errors } }) => {
          expect(errors).toBeDefined();
          expect(errors).toHaveProperty('authorize', expect.any(Array));
        });
    });
  });
});
