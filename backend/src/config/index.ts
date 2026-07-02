import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_VERSION: z.string().default('v1'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRE: z.string().default('15m'),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  ADMIN_EMAIL: z.string().email().optional().default('anuj.tarale8401@appaspect.com'),
  ADMIN_PASSWORD: z.string().optional().default('Admin@8401')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const env = parsedEnv.data;

export default {
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  apiVersion: env.API_VERSION,
  mongodbUri: env.MONGODB_URI,
  jwt: {
    secret: env.JWT_SECRET,
    accessExpire: env.JWT_ACCESS_EXPIRE,
    refreshExpire: env.JWT_REFRESH_EXPIRE
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  clientUrl: env.CLIENT_URL,
  admin: {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    emailVerificationExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetExpiry: 10 * 60 * 1000, // 10 minutes
    bcryptSaltRounds: 12,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax' as const,
      maxAge: parseInt(env.JWT_REFRESH_EXPIRE) * 24 * 60 * 60 * 1000
    }
  }
};
