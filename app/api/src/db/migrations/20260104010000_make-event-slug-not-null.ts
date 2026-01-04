import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Make slug NOT NULL in events table
    ALTER TABLE events
    ALTER COLUMN slug SET NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Allow slug to be nullable again
    ALTER TABLE events
    ALTER COLUMN slug DROP NOT NULL;
  `);
}
