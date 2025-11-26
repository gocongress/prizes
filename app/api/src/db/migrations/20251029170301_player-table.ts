import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE players (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL REFERENCES users(id),
			aga_id TEXT NOT NULL,
			rank REAL,
			name TEXT,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE
		);

		CREATE INDEX players_user_id_idx ON players(user_id);
		CREATE INDEX players_user_id_active_idx ON players(user_id) WHERE deleted_at IS NULL;
		CREATE UNIQUE INDEX players_lower_aga_id_unique ON players (LOWER(aga_id));
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP UNIQUE INDEX IF EXISTS players_lower_aga_id_unique;
		DROP INDEX IF EXISTS players_user_id_idx;
		DROP INDEX IF EXISTS players_user_id_active_idx;
		DROP TABLE IF EXISTS players;
	`);
}
