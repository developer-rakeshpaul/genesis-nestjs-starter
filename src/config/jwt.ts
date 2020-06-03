import ms from 'ms';
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    options: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m', // 15 minutes
    },
    tokenExpiry() {
      return new Date(
        new Date().getTime() + ms(process.env.ACCESS_TOKEN_EXPIRES || '15m'),
      );
    },
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    maxAge(role) {
      const maxAge =
        role === 'appuser'
          ? +process.env.APP_USER_REFRESH_TOKEN_MAX_AGE || 90 * 24 * 60
          : +process.env.REFRESH_TOKEN_MAX_AGE || 30 * 24 * 60;
      return maxAge * 60 * 1000;
    },
    expiresIn(role) {
      return role === 'appuser'
        ? process.env.APP_USER_REFRESH_TOKEN_EXPIRES || '90d' // expire after 90 days:
        : process.env.REFRESH_TOKEN_EXPIRES || '30d'; // expire after 30 days
    },
    tokenExpiry(role) {
      return new Date(
        new Date().getTime() + ms(this.jwt.refreshToken.expiresIn(role)),
      );
    },
  },
}));
