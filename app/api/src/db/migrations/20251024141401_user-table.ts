import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE users (
			id UUID PRIMARY KEY,
			email TEXT NOT NULL,
			one_time_passes JSONB NOT NULL DEFAULT '[]'::jsonb,
			scope TEXT NOT NULL DEFAULT 'USER',
			last_login_at TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE,

			CONSTRAINT scope_check CHECK (scope IN ('USER', 'ADMIN'))
		);

		CREATE UNIQUE INDEX users_lower_email_unique ON users (LOWER(email));
		CREATE INDEX users_active_idx ON users(id) WHERE deleted_at IS NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX IF EXISTS users_active_idx;
		DROP UNIQUE INDEX IF EXISTS users_lower_email_unique;
		DROP TABLE IF EXISTS users;
	`);
}
