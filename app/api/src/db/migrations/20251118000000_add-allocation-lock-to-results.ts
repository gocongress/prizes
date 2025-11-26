import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE results
    ADD COLUMN allocation_locked_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN allocation_finalized_at TIMESTAMP WITH TIME ZONE;

    -- Add index to quickly find locked/finalized results
    CREATE INDEX idx_results_allocation_locked ON results(allocation_locked_at) WHERE allocation_locked_at IS NOT NULL;
    CREATE INDEX idx_results_allocation_finalized ON results(allocation_finalized_at) WHERE allocation_finalized_at IS NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_results_allocation_locked;
    DROP INDEX IF EXISTS idx_results_allocation_finalized;

    ALTER TABLE results
    DROP COLUMN IF EXISTS allocation_locked_at,
    DROP COLUMN IF EXISTS allocation_finalized_at;
  `);
}
