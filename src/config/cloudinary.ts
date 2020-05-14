import { ConfigOptions } from 'cloudinary';

/* eslint-disable @typescript-eslint/camelcase */
export const cloudinaryConfigOptions: Partial<ConfigOptions> = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

export default cloudinaryConfigOptions;
