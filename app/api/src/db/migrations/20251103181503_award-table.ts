import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE awards (
			id UUID PRIMARY KEY,
			prize_id UUID REFERENCES prizes(id),
			player_id UUID REFERENCES players(id),
			redeem_code TEXT,
			value REAL NOT NULL DEFAULT 0.0,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc', NOW())),
			updated_at TIMESTAMP WITH TIME ZONE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE awards;');
}
