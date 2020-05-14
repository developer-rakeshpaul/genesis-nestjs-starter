import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// config/database.ts
const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  // name: process.env.TYPEORM_DATABASE,
  port: +process.env.TYPEORM_PORT,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../**/**.entity{.ts,.js}'], // process.env.TYPEORM_ENTITIES.split(','),
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
};

export default typeOrmModuleOptions;
