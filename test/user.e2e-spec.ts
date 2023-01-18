/* Tests for /api/users/*
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'


describe('User and Auth', () => {
  let app: INestApplication
  let api

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()

    api = app.getHttpServer()
  })

  describe('POST /users', () => {
    it('should create new accounts', () => {
      return request(api)
        .post('/api/users')
        .send({
          "user": {
            "username": "Jacob",
            "email": "jake@jake.jake",
            "password": "jakejake"
          }
        })
        .expect(201)
        .expect(res => {
          expect(res.body.user).toBeInstanceOf(Object)
          expect(res.body.user.email).toEqual("jake@jake.jake")
          expect(res.body.user.username).toEqual("Jacob")
          expect(res.body.user.password).toBeUndefined()
          expect(res.body.user.bio).toBeDefined()
          expect(res.body.user.image).toBeDefined()
        })
    })

    it('should require email, username, password', () => {
      return request(api)
        .post('/api/users')
        .send({
          user: {}
        })
        .expect(422)
        .expect(res => {
          expect(res.body.errors).toBeInstanceOf(Object)
          expect(res.body.errors.email).toBeInstanceOf(Array)
          expect(res.body.errors.password).toBeInstanceOf(Array)
          expect(res.body.errors.username).toBeInstanceOf(Array)
        })
    })

    it('should check whether email is unique.', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          "user": {
            "username": "Jacob",
            "email": "jake@jake.jake",
            "password": "jakejake"
          }
        })
        .expect(409)
        .expect(res => {
          expect(res.body.errors).toBeInstanceOf(Object)
          expect(res.body.errors.email).toBeInstanceOf(Array)
          expect(res.body.errors.password).toBeUndefined()
          expect(res.body.errors.username).toBeUndefined()
        })
    })

    it.todo('')
  })
})

