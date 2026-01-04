import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE events
		ADD COLUMN slug TEXT UNIQUE;

		CREATE UNIQUE INDEX events_slug_idx ON events(slug);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX IF EXISTS events_slug_idx;
		ALTER TABLE events DROP COLUMN slug;
	`);
}
