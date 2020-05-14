export default {
  name: process.env.NAME,
  port: +process.env.API_PORT,
  domain: process.env.DOMAIN,
  host: process.env.HOST,
  web: process.env.WEB,
  confirmPath: process.env.CONFIRM_PATH,
  collaboratorConfirmPath: process.env.COLLABORATOR_CONFIRM_PATH,
  forgetPath: process.env.FORGOT_PASSWORD_PATH,
  isSecure: process.env.IS_SECURE === 'true',
  secret: process.env.APP_SECRET,
  environment: process.env.NODE_ENV,
  magicCodeExpiry: process.env.MAGIC_CODE_EXPIRY
    ? +process.env.MAGIC_CODE_EXPIRY
    : 60,
  emails() {
    if (process.env.SUPER_ADMIN_EMAILS) {
      return process.env.SUPER_ADMIN_EMAILS.split(',');
    }
    return ['accounts@genesis.dev'];
  },
  isProduction() {
    return this.get('api.environment') === 'production';
  },
  protocol() {
    return this.get('api.isSecure') ? 'https' : 'http';
  },
  webUrl() {
    return `${this.get('api').protocol()}://${this.get('api.web')}`;
  },
  apiUrl() {
    return `${this.get('api').protocol()}://${this.get('api.host')}`;
  },
  confirmUrl() {
    return `${this.get('api').webUrl()}${this.get('api.confirmPath')}`;
  },

  collaboratorConfirmUrl() {
    return `${this.get('api').webUrl()}${this.get(
      'api.collaboratorConfirmPath',
    )}`;
  },
  forgetUrl() {
    return `${this.get('api').webUrl()}${this.get('api.forgetPath')}`;
  },
  projectTypeTitles() {
    if (process.env.PROJECT_TYPE_TITLES) {
      return process.env.PROJECT_TYPE_TITLES.split(',');
    }
    return ['The Past in My Place', 'A Life in Time'];
  },
};
