export default {
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    options: {
      expiresIn: 15 * 60, // 15 minutes
    },
  },

  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    options: {
      expiresIn: 60 * 60 * 24 * 1, // 1 days
    },
  },
};
