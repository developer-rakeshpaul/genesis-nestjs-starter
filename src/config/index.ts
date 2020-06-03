// created from 'create-ts-index'

import apiConfig from './api';
import cloudinaryConfig from './cloudinary';
import dbConfig from './database';
import jwtConfig from './jwt';
import mailerConfig from './mailer';
import redisConfig from './redis';
import sessionConfig from './session';
import socialConfig from './social';
import storageConfig from './storage';

export const configs = [
  apiConfig,
  cloudinaryConfig,
  dbConfig,
  jwtConfig,
  mailerConfig,
  redisConfig,
  sessionConfig,
  socialConfig,
  storageConfig,
];

export default {
  apiConfig,
  cloudinaryConfig,
  dbConfig,
  jwtConfig,
  mailerConfig,
  redisConfig,
  sessionConfig,
  socialConfig,
  storageConfig,
};
