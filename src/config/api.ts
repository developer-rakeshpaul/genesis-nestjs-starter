import { registerAs } from '@nestjs/config';

export default registerAs('api', () => ({
  name: process.env.NAME,
  port: +process.env.API_PORT,
  domain: process.env.DOMAIN,
  host: process.env.HOST,
  web: process.env.WEB,
  confirmPath: process.env.CONFIRM_PATH,
  forgetPath: process.env.FORGOT_PASSWORD_PATH,
  isSecure: process.env.IS_SECURE === 'true',
  secret: process.env.APP_SECRET,
  environment: process.env.NODE_ENV,
  verficationRequired: process.env.LOGIN_WITHOUT_VERIFICATION === 'true',
  emails() {
    if (process.env.SUPER_ADMIN_EMAILS) {
      return process.env.SUPER_ADMIN_EMAILS.split(',');
    }
    return ['accounts@genesis.dev'];
  },
  isProduction() {
    return this.environment === 'production';
  },
  protocol() {
    return this.isSecure ? 'https' : 'http';
  },
  webUrl() {
    return `${this.protocol()}://${this.web}`;
  },
  apiUrl() {
    return `${this.protocol()}://${this.host}`;
  },
  confirmUrl() {
    return `${this.webUrl()}${this.confirmPath}`;
  },
  forgetUrl() {
    return `${this.webUrl()}${this.forgetPath}`;
  },
}));
