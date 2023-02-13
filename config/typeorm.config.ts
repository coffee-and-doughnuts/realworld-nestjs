import { TypeOrmModuleOptions } from '@nestjs/typeorm'

// TODO: Seperate options per environments: product, env, test
// options: {environment: TypeOrmModuleOptions} looks good.

const defaultOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'realworld',
  password: 'realworld',
  database: 'realworld-nestjs-dev',
  // entities: ["**/*.entity.{js,ts}"],
  // synchronize: true, // TODO: use only test and dev.
}

export default function(node_env: string): TypeOrmModuleOptions {
  if (node_env === "product") {
    return  {
      entities: ["../**/*.entity.{ts, js}"],
      synchronize: false,
      ...defaultOptions,
    }
  }

  if (node_env === "test") {
    return {
      entities: ["**/*.entity.{ts, js}"],
      synchronize: true,
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
    }
  }

  if (node_env === "dev" || node_env === undefined) {
    return {
      entities: ["dist/**/*.entity.{ts,js}"],
      synchronize: true,
      ...defaultOptions,
    }
  }
}
