import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE EXTENSION IF NOT EXISTS pg_trgm;

		CREATE INDEX idx_prizes_deleted_at ON prizes (deleted_at) WHERE deleted_at IS NULL;

		-- For full-text-like ILIKE searches on title and description
		CREATE INDEX idx_prizes_title_trgm ON prizes USING gin (title gin_trgm_ops);
		CREATE INDEX idx_prizes_description_trgm ON prizes USING gin (description gin_trgm_ops);

		-- For event title search
		CREATE INDEX idx_events_title_trgm ON events USING gin (title gin_trgm_ops);

		-- Foreign key joins
		CREATE INDEX idx_prizes_event_id ON prizes (event_id);
		CREATE INDEX idx_awards_prize_id ON awards (prize_id);
		CREATE INDEX idx_awards_player_id ON awards (player_id);
		CREATE INDEX idx_players_user_id ON players (user_id);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		DROP INDEX idx_prizes_deleted_at;

		-- For full-text-like ILIKE searches on title and description
		DROP INDEX idx_prizes_title_trgm;
		DROP INDEX idx_prizes_description_trgm;

		-- For event title search
		DROP INDEX idx_events_title_trgm;

		-- Foreign key joins
		DROP INDEX idx_prizes_event_id;
		DROP INDEX idx_awards_prize_id;
		DROP INDEX idx_awards_player_id;
		DROP INDEX idx_players_user_id;
	`);
}
