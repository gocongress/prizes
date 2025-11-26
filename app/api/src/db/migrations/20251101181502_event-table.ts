import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE events (
			id UUID PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			start_at TIMESTAMP WITH TIME ZONE NOT NULL,
			end_at TIMESTAMP WITH TIME ZONE NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE events;');
}
