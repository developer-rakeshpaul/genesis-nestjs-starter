import { RedisModuleOptions } from 'nestjs-redis';

const redisDefaultOptions: RedisModuleOptions = {
  name: process.env.REDIS_NAME,
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
  db: +process.env.REDIS_DB || 0,
  keyPrefix: process.env.REDIS_PRIFIX,
  password: process.env.REDIS_PASSWORD,
};

export default redisDefaultOptions;
