import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Make event_id NOT NULL in prizes table
    ALTER TABLE prizes
    ALTER COLUMN event_id SET NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Allow event_id to be nullable again
    ALTER TABLE prizes
    ALTER COLUMN event_id DROP NOT NULL;
  `);
}
