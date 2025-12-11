import type { ScopeKind } from '@/lib/handlers';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import type { Knex } from 'knex';
import type { Logger } from 'pino';

export type DbConfig = {
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    schema: string;
    ssl: boolean | { rejectUnauthorized: boolean };
    debug: boolean;
  };
};

export type Context = {
  serviceName: string;
  handlerName: string;
  handlerEndpoint: string;
  request?: {
    id?: string;
    scopes?: ScopeKind;
    token?: string;
    jwtPayload?: JwtPayload;
    url?: string;
    method?: string;
    start?: number;
  };
  env: 'test' | 'development' | 'staging' | 'production';
  api: {
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: Knex<any, unknown[]>;
  logger: Logger;
  runtime: {
    logLevel: string;
    localhost: boolean;
    jwtSecretKey: string;
    jwtExpiresIn: SignOptions['expiresIn']; // ie. '1h', '7d'
    adminEmails: string[];
    supportEmail: string;
    smtp: {
      enabled: boolean;
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
    turnstile?: {
      enabled: boolean;
      secretKey: string;
      timeout: number;
    };
    webhooks: {
      regfox: {
        signingSecret: string;
      };
    };
  };
  server: {
    host: string;
    port: string;
    maxBodySize: string; // ie. 1500kb
    cookieName: string;
    cookieDomain: string;
    cookieMaxAge: number;
    corsAllowedOrigins: string[];
  };
};

export type ContextConfig = DbConfig & Pick<Context, 'env' | 'runtime' | 'server' | 'serviceName'>;

export const ContextKinds = {
  UNKNOWN: 'unknown',
  AWARD: 'award',
  AWARD_PREFERENCE: 'awardPreference',
  EVENT: 'event',
  PRIZE: 'prize',
  RESULT: 'result',
  USER: 'user',
  PLAYER: 'player',
} as const;
export type ContextKind = (typeof ContextKinds)[keyof typeof ContextKinds];

export type ServiceParams<T> = {
  context: Context;
  input?: T;
};
