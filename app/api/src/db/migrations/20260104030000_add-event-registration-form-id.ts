import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE events
		ADD COLUMN registration_form_id TEXT UNIQUE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE events
		DROP COLUMN registration_form_id;
	`);
}
