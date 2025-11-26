import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE prizes
			ADD COLUMN recommended_rank TEXT NOT NULL DEFAULT 'ALL'
			CHECK (recommended_rank IN ('ALL', 'DAN', 'SDK', 'DDK'));
		ALTER TABLE prizes
			DROP COLUMN value;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE prizes
			ADD COLUMN value REAL;
		ALTER TABLE prizes
			DROP COLUMN recommended_rank;
	`);
}
