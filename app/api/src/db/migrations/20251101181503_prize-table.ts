import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE prizes (
			id UUID PRIMARY KEY,
			event_id UUID REFERENCES events(id),
			title TEXT NOT NULL,
			description TEXT,
			value REAL,
			quantity SMALLSERIAL NOT NULL,
			image BYTEA,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE prizes;');
}
