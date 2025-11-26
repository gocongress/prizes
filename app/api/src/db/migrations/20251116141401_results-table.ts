import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE results (
			id UUID PRIMARY KEY,
			event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
			winners JSONB NOT NULL DEFAULT '[]'::jsonb,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE,

			CONSTRAINT winners_valid_jsonb CHECK (jsonb_typeof(winners) = 'array')
		);

		CREATE INDEX results_event_id_idx ON results(event_id);
		CREATE INDEX results_active_idx ON results(id) WHERE deleted_at IS NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX IF EXISTS results_active_idx;
		DROP INDEX IF EXISTS results_event_id_idx;
		DROP TABLE IF EXISTS results;
	`);
}
