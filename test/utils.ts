import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

export async function dropTables() {}

export async function clearTables() {}

export async function createTestModule(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return moduleFixture.createNestApplication();
}

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    save: jest.fn((entity) => entity),
    findOne: jest.fn((e) => e),
    findOneBy: jest.fn((entity) => entity),
    count: jest.fn((entity) => entity),
    update: jest.fn(),
  }),
);
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};
