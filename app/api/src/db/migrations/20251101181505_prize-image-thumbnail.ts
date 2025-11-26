import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE prizes
			ADD COLUMN image_thumbnail BYTEA;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE prizes
			DROP COLUMN image_thumbnail;
	`);
}
