import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE events
		ADD COLUMN self_registration_enabled BOOLEAN NOT NULL DEFAULT FALSE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE events
		DROP COLUMN self_registration_enabled;
	`);
}
