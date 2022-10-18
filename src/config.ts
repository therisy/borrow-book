import * as dotenv from 'dotenv';
dotenv.config();

interface Config {
  PORT: number;
  VERSION: string;
  ORIGINS: string[];
  NEW_RELIC_LICENSE_KEY: string;
  SECRET: string;
  MONGO_URL: string;
  GOOGLE_API_KEY: string;
  REDIS_HOST: string;
  DEV: boolean;
}

const CONFIG: Config = {
  PORT: parseInt(process.env.PORT) || 3000,
  VERSION: process.env.VERSION || '1.0.0',
  ORIGINS: process.env.ORIGINS ? process.env.ORIGINS.split(',') : [],
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY || '',
  SECRET: process.env.SECRET,
  MONGO_URL: process.env.MONGO_URL,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  REDIS_HOST: process.env.REDIS_HOST,
  DEV: process.env.NODE_ENV === 'development',
};

export default CONFIG;
