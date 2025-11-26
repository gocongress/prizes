import type { DbConfig } from '@/types';
import Knex from 'knex';

export const buildKnexConfig = (config: DbConfig) => ({
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    database: config.db.database,
    password: config.db.password,
    ssl: config.db.ssl,
  },
  pool: {
    min: 0,
    max: 10,
  },
  debug: config.db.debug,
  searchPath: [config.db.schema],
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
    schemaName: config.db.schema,
  },
});

// Singleton Knex instance
let knexInstance: ReturnType<typeof Knex> | null = null;

export const knex = (config: DbConfig) => {
  if (!knexInstance) {
    knexInstance = Knex(buildKnexConfig(config));
  }
  return knexInstance;
};
