import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE award_preferences (
			id UUID PRIMARY KEY,
			player_id UUID NOT NULL REFERENCES players(id),
			award_id UUID NOT NULL REFERENCES awards(id),
			prize_id UUID NOT NULL REFERENCES prizes(id),
			preference_order SMALLINT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE,
			UNIQUE(player_id, award_id),
			UNIQUE(player_id, preference_order)
		);

		CREATE INDEX award_preferences_player_id_idx ON award_preferences(player_id);
		CREATE INDEX award_preferences_award_id_idx ON award_preferences(award_id);
		CREATE INDEX award_preferences_prize_id_idx ON award_preferences(prize_id);
		CREATE INDEX award_preferences_player_order_idx ON award_preferences(player_id, preference_order);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX IF EXISTS award_preferences_player_id_idx;
		DROP INDEX IF EXISTS award_preferences_award_id_idx;
		DROP INDEX IF EXISTS award_preferences_prize_id_idx;
		DROP INDEX IF EXISTS award_preferences_player_order_idx;
		DROP TABLE IF EXISTS award_preferences;
	`);
}
