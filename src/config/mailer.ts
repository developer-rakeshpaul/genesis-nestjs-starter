import { registerAs } from '@nestjs/config';
export default registerAs('mailer', () => ({
  useTestAccount: process.env.MAILER_USE_TEST_ACCOUNT === 'true',
  transport: {
    type: process.env.MAILER_TYPE || 'smtp',
    host: process.env.MAILER_HOST,
    port: +process.env.MAILER_PORT,
    secure: process.env.MAILER_SECURE === 'true',
    // tls: {
    //   rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED === 'true',
    // },
    ignoreTLS: true,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
  defaults: {
    forceEmbeddedImages: true,
    from: '"genesis.dev" <support@genesis.dev>',
  },
  templateDir: './templates',
  from() {
    return this.mailer.transport.auth.user;
  },
}));
