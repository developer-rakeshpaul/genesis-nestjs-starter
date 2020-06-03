import { registerAs } from '@nestjs/config';
export default registerAs('storage', () => ({
  TYPE_STORAGE_IMAGE: process.env.TYPE_STORAGE,
  ALLOW_AVATAR_FILE: ['image/png', 'image/jpeg'],

  // FOR TESTING
  FTP_STORAGE: {
    basepath: process.env.FTP_STORAGE_BASE_PATH,
    ftp: {
      host: process.env.FTP_STORAGE_HOST,
      secure: process.env.FTP_STORAGE_SECURE,
      user: process.env.FTP_STORAGE_USER,
      password: process.env.FTP_STORAGE_PASSWORD,
    },
  },

  AWS_STORAGE: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_BUCKET: process.env.AWS_BUCKET,
    AWS_ACL: process.env.AWS_ACL,
    AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
    AWS_S3_BUCKET_ENDPOINT: process.env.AWS_S3_BUCKET_ENDPOINT === 'true',
  },

  AVATAR_URL: process.env.AVATAR_URL,
}));
