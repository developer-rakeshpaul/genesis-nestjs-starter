import { registerAs } from '@nestjs/config';

export default registerAs('social', () => ({
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callback: process.env.GOOGLE_CALLBACK,
  },
}));
