import { knex } from '@/db/db';
import type { Context, ContextConfig } from '@/types';
import pino from 'pino';

export const buildServiceContext = ({
  env,
  runtime,
  server,
  serviceName,
  db,
}: ContextConfig): Context => {
  let context = {
    env,
    serviceName,
    handlerName: 'unknown',
    handlerEndpoint: 'unknown',
    api: {
      version: '1.0',
      kind: 'unknown',
    },
    logger: pino({
      level: runtime.logLevel,
    }),
    runtime,
    server,
  } as unknown as Context;

  context.db = knex({ db });

  return context;
};
