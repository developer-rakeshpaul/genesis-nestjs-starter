import { registerAs } from '@nestjs/config';
import { RedisModuleOptions } from 'nestjs-redis';

export default registerAs(
  'redis',
  (): RedisModuleOptions => ({
    name: process.env.REDIS_NAME,
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    db: +process.env.REDIS_DB || 0,
    keyPrefix: process.env.REDIS_PRIFIX,
    password: process.env.REDIS_PASSWORD,
  }),
);
