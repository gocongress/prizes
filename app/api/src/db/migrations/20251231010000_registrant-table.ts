import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE registrants (
			id UUID PRIMARY KEY,
			player_id UUID NOT NULL REFERENCES players(id),
			event_id UUID NOT NULL REFERENCES events(id),
			registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			status TEXT,
			notes TEXT,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			deleted_at TIMESTAMP WITH TIME ZONE,
			CONSTRAINT unique_player_event UNIQUE (player_id, event_id)
		);

		CREATE INDEX registrants_player_id_idx ON registrants(player_id);
		CREATE INDEX registrants_event_id_idx ON registrants(event_id);
		CREATE INDEX registrants_player_event_active_idx ON registrants(player_id, event_id) WHERE deleted_at IS NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX IF EXISTS registrants_player_id_idx;
		DROP INDEX IF EXISTS registrants_event_id_idx;
		DROP INDEX IF EXISTS registrants_player_event_active_idx;
		DROP TABLE IF EXISTS registrants;
	`);
}
