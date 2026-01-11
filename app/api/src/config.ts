import type { SignOptions } from 'jsonwebtoken';

const getEnv = () => {
  switch (process.env.NODE_ENV) {
    case 'test':
      return 'test';
    case 'development':
      return 'development';
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    default:
      return 'development';
  }
};

const env = getEnv();

const serviceName = process.env.SERVICE_NAME || '';
if (!serviceName) {
  throw new Error(`Service configuration error, missing SERVICE_NAME in ENV.`);
}

const server = {
  url: process.env.SERVER_URL || 'http://localhost:3001',
  host: process.env.SERVER_HOST || '0.0.0.0',
  port: process.env.SERVER_PORT || '3001',
  maxBodySize: process.env.SERVER_MAX_BODY_SIZE || '1500kb',
  cookieName: process.env.COOKIE_NAME || 'auth',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost', // ex. .superheavy.industries
  cookieMaxAge: Number.parseInt(process.env.COOKIE_MAXAGE || (60 * 60 * 24 * 7 * 1000).toString()), // ex. 1 week in milliseconds
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()),
};
const db = {
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  schema: `${process.env.DB_SCHEMA || 'public'}${env === 'test' ? '_test' : ''}`,
  ssl:
    process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
      ? { rejectUnauthorized: false }
      : false,
  debug: !!process.env.DB_DEBUG,
};
const runtime = {
  localhost: !!process.env.LOCALHOST,
  logLevel: process.env.LOG_LEVEL || 'debug',
  jwtSecretKey: process.env.JWT_SECRET_KEY!,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  adminEmails: process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : [],
  supportEmail: process.env.SUPPORT_EMAIL || 'noreply@gocongress.org',
  otpCodeLength: Number.parseInt(process.env.OTP_CODE_LENGTH || '8', 10),
  smtp: {
    enabled: process.env.SMTP2GO_ENABLED === 'true' || process.env.SMTP2GO_ENABLED === '1',
    apiKey: process.env.SMTP2GO_API_KEY || '',
    fromEmail: process.env.SMTP2GO_FROM_EMAIL || 'noreply@gocongress.org',
    fromName: process.env.SMTP2GO_FROM_NAME || 'AGA Prizes',
  },
  turnstile: {
    enabled: process.env.TURNSTILE_ENABLED === 'true' || process.env.TURNSTILE_ENABLED === '1',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
    timeout: Number.parseInt(process.env.TURNSTILE_TIMEOUT || '3000', 10),
  },
  webhooks: {
    regfox: {
      signingSecret: process.env.REGFOX_WEBHOOK_SIGNING_SECRET || '',
    },
  },
};

export { db, env, runtime, server, serviceName };
