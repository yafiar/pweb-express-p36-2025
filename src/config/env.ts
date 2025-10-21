import 'dotenv/config';

export const env = {
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
