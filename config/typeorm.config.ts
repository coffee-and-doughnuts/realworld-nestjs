import { TypeOrmModuleOptions } from '@nestjs/typeorm'

// TODO: Seperate options per environments: product, env, test
// options: {environment: TypeOrmModuleOptions} looks good.

const options: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'realworld',
  password: 'realworld',
  database: 'realworld-nestjs-dev',
  entities: ["dist/**/*.entity.{js,ts}"],
  synchronize: true, // TODO: use only test and dev.
}

export default options
