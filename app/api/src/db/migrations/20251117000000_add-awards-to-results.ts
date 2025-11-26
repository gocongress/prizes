import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE results
		ADD COLUMN awards JSONB NOT NULL DEFAULT '[]'::jsonb,
		ADD CONSTRAINT awards_valid_jsonb CHECK (jsonb_typeof(awards) = 'array');
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE results
		DROP CONSTRAINT IF EXISTS awards_valid_jsonb,
		DROP COLUMN IF EXISTS awards;
	`);
}
