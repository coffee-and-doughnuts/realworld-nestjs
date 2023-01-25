import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../src/user/user.entity';

describe('User and Auth', () => {
  let app: INestApplication;
  let datasource: DataSource
  let userRepo: Repository<User>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    datasource = app.get(DataSource)
    userRepo = datasource.getRepository(User)
    app.useGlobalPipes(
      new ValidationPipe({transform: true})
    )
    await app.init();
    app.setGlobalPrefix('api');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // clear database before test each case.
    await datasource.synchronize(true)
  });

  describe('POST /users', () => {
    it('should create new accounts', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          user: {
            username: 'Jacob',
            email: 'jake@jake.jake',
            password: 'jakejake',
          },
        })
        .expect(201)
        .expect(res => {
          console.log(res.body)
          expect(res.body.user).toBeInstanceOf(Object);
          expect(res.body.user.email).toEqual('jake@jake.jake');
          expect(res.body.user.username).toEqual('Jacob');
          expect(res.body.user.password).toBeUndefined();
          expect(res.body.user.bio).toBeDefined();
          expect(res.body.user.image).toBeDefined();
        });
    });

    it('should require email, username, password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          user: {},
        })
        .expect(422)
        .expect((res) => {
          expect(res.body.errors).toBeInstanceOf(Object);
          expect(res.body.errors.email).toBeInstanceOf(Array);
          expect(res.body.errors.password).toBeInstanceOf(Array);
          expect(res.body.errors.username).toBeInstanceOf(Array);
        });
    });

    it('should check whether email is unique.', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          user: {
            username: 'Jacob',
            email: 'jake@jake.jake',
            password: 'jakejake',
          },
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.errors).toBeInstanceOf(Object);
          expect(res.body.errors.email).toBeInstanceOf(Array);
          expect(res.body.errors.password).toBeUndefined();
          expect(res.body.errors.username).toBeUndefined();
        });
    });

    it.todo('');
  });
});
