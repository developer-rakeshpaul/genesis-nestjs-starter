import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// config/database.ts
const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: +process.env.POSTGRES_PORT,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../**/**.entity{.ts,.js}'], // process.env.TYPEORM_ENTITIES.split(','),
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
};

export default typeOrmModuleOptions;
