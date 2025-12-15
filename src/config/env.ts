import 'dotenv/config';

const requiredEnv: Array<keyof NodeJS.ProcessEnv> = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
	type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: string;
};

function getEnv<K extends keyof Env>(key: K): Env[K] {
  const value = process.env[key];
  if (!value) {
    throw new Error(Missing required environment variable );
  }
  return value as Env[K];
}

export const env = {
  databaseUrl: () => getEnv('DATABASE_URL'),
  jwtSecret: () => getEnv('JWT_SECRET'),
  port: () => getEnv('PORT'),
};
