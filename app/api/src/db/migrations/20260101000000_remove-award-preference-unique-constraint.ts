import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE award_preferences
		DROP CONSTRAINT award_preferences_player_id_preference_order_key;
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
		ALTER TABLE award_preferences
		ADD CONSTRAINT award_preferences_player_id_preference_order_key
		UNIQUE(player_id, preference_order);
	`);
}
