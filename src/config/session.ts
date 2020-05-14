import expressSession from 'express-session';
import { SESSION_COOKIE_NAME } from '@app/constants';
// import { SESSION_COOKIE_NAME } from './../app/constants';

const sessionOptions: expressSession.SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  name: SESSION_COOKIE_NAME,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
  },
};

export default sessionOptions;
