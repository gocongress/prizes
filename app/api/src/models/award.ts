import { getQueryParams } from '@/lib/handlers';
import {
  AwardQueryFields,
  AwardQueryKeys,
  type AwardApi,
  type AwardDb,
  type AwardQueryKey,
  type AwardQueryParams,
  type AwardWithPrizeApi,
  type CreateAward,
  type UpdateAward,
} from '@/schemas/award';
import type { AwardPreferenceDb } from '@/schemas/awardPreference';
import type { EventDb } from '@/schemas/event';
import { type PrizeApi, type PrizeDb } from '@/schemas/prize';
import { ContextKinds, type Context } from '@/types';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { TABLE_NAME as AWARD_PREFERENCE_TABLE_NAME } from './awardPreference';
import { TABLE_NAME as EVENT_TABLE_NAME } from './event';
import { TABLE_NAME as PLAYER_TABLE_NAME } from './player';
import { TABLE_NAME as PRIZE_TABLE_NAME } from './prize';

export const TABLE_NAME = 'awards';

type AwardWithPrizeDb = AwardDb & {
  prize?: PrizeDb & { event_title: EventDb['title'] };
};

type AwardWithPreferenceDb = AwardDb & {
  preference_order?: AwardPreferenceDb['preference_order'];
};

const asModel = (
  item: AwardDb & {
    prize_title?: PrizeApi['title'];
    prize_description?: PrizeApi['description'];
    player_name?: string;
  },
): AwardApi => {
  return {
    id: item.id,
    kind: ContextKinds.AWARD,
    value: item.value,
    playerId: item.player_id,
    playerName: item.player_name,
    prizeId: item.prize_id,
    prizeDescription: item.prize_description,
    prizeTitle: item.prize_title,
    redeemCode: item.redeem_code,
    createdAt: item.created_at.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
    available: !Boolean(item.player_id),
  };
};

export const getAll = async (
  context: Context,
  queryParams: AwardQueryParams,
): Promise<{
  orderBy: AwardQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: AwardApi[];
}> => {
  const totalCountResult = await context
    .db<AwardDb>(TABLE_NAME)
    .count<{ count: number }>('id as count')
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<AwardQueryKey>(AwardQueryKeys, queryParams, totalItems);

  const query = context
    .db<AwardDb>(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(
        `CASE
          WHEN ${PLAYER_TABLE_NAME}.id IS NULL THEN NULL
          ELSE CONCAT(${PLAYER_TABLE_NAME}.aga_id, ' - ', ${PLAYER_TABLE_NAME}.name)
        END as player_name`,
      ),
      `${PRIZE_TABLE_NAME}.title as prize_title`,
      `${PLAYER_TABLE_NAME}.name`,
    )
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.player_id`, `${PLAYER_TABLE_NAME}.id`)
    .leftJoin(PRIZE_TABLE_NAME, `${TABLE_NAME}.prize_id`, `${PRIZE_TABLE_NAME}.id`)
    .leftJoin(EVENT_TABLE_NAME, `${PRIZE_TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`);

  if (queryParams.ids) {
    query.whereIn(`${TABLE_NAME}.id`, queryParams.ids);
  } else if (queryParams.prize_id) {
    query.where(`${TABLE_NAME}.prize_id`, queryParams.prize_id);
  }

  // Improve this if future table-joined fields are include in the orderBy
  let orderByTable;
  switch (orderBy) {
    case 'playerName':
      orderByTable = `${PLAYER_TABLE_NAME}.name`;
      break;
    case 'prizeTitle':
      orderByTable = `${PRIZE_TABLE_NAME}.title`;
      break;
    case 'eventTitle':
      orderByTable = `${EVENT_TABLE_NAME}.title`;
      break;

    default:
      orderByTable = `${TABLE_NAME}.${AwardQueryFields[orderBy]}`;
      break;
  }

  const rows = await query.orderBy(orderByTable, orderDirection).offset(offset).limit(pageSize);

  return {
    orderBy,
    orderDirection,
    pageIndex: page,
    totalPages: totalPages,
    itemsPerPage: pageSize,
    totalItems,
    currentItemCount: rows.length,
    items: rows.map(asModel),
  };
};

export const getById = async (
  context: Context,
  id: AwardApi['id'],
): Promise<AwardApi | undefined> => {
  const rows = await context.db<AwardDb>(TABLE_NAME).where({ id }).returning<AwardDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: Partial<CreateAward>,
): Promise<AwardApi | undefined> => {
  const rows = await trx<AwardDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      player_id: input.playerId,
      prize_id: input.prizeId,
      redeem_code: input.redeemCode,
      value: input.value,
      created_at: new Date(),
    })
    .returning<AwardDb[]>('*');

  if (!rows.length) {
    return;
  }

  context.logger.debug({ id: rows[0].id }, 'New award created');
  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: AwardApi['id'],
  input: Partial<UpdateAward>,
): Promise<AwardApi | undefined> => {
  const awardRows = await context.db<AwardDb>(TABLE_NAME).where({ id }).returning<AwardDb[]>('*');

  if (!awardRows.length) {
    return;
  }

  const rows = await trx<AwardDb>(TABLE_NAME)
    .where({ id })
    .update({
      updated_at: new Date(),
      player_id: input.playerId,
      redeem_code: input.redeemCode,
      value: input.value,
    })
    .returning<AwardDb[]>('*');

  if (!rows.length) {
    throw new Error('Failed updating award.');
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: AwardApi['id'],
): Promise<number> => trx<AwardDb>(TABLE_NAME).where({ id }).del();

/**
 * Query all of the Awards that a User/Player has won including the prize detail such as the picture
 * description, url, title, etc.
 *
 * @param context - The application context
 * @param input.userId - The ID of the currently logged in user
 * @param input.playerId - The ID of the player
 * @returns The awards belonging to the user's player
 */
export const getByUserPlayerId = async (
  context: Context,
  input: { playerId: string; userId: string },
): Promise<{ items: AwardWithPrizeApi[] }> => {
  const awards = await context
    .db(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(`
        COALESCE(
            json_build_object(
              'id',               ${PRIZE_TABLE_NAME}.id,
              'title',            ${PRIZE_TABLE_NAME}.title,
              'description',      ${PRIZE_TABLE_NAME}.description,
              'url',              ${PRIZE_TABLE_NAME}.url,
              'recommended_rank', ${PRIZE_TABLE_NAME}.recommended_rank,
              'event_id',         ${PRIZE_TABLE_NAME}.event_id,
              'event_title',      ${EVENT_TABLE_NAME}.title,
              'image_type',       ${PRIZE_TABLE_NAME}.image_type,
              'image_thumbnail',  encode(${PRIZE_TABLE_NAME}.image_thumbnail, 'base64'),
              'created_at',       ${PRIZE_TABLE_NAME}.created_at,
              'updated_at',       ${PRIZE_TABLE_NAME}.updated_at
            ), NULL
        ) as "prize"
      `),
    )
    .leftJoin(PRIZE_TABLE_NAME, `${TABLE_NAME}.prize_id`, `${PRIZE_TABLE_NAME}.id`)
    .leftJoin(EVENT_TABLE_NAME, `${PRIZE_TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.player_id`, `${PLAYER_TABLE_NAME}.id`)
    .where(`${TABLE_NAME}.player_id`, input.playerId)
    .andWhere(`${PLAYER_TABLE_NAME}.user_id`, input.userId)
    .orderBy(`${TABLE_NAME}.created_at`, 'desc')
    .returning<AwardWithPrizeDb[]>('*');

  return {
    items: awards.map((award) => ({
      ...asModel(award),
      prize: award.prize
        ? {
            id: award.prize.id,
            kind: ContextKinds.PRIZE,
            title: award.prize.title,
            description: award.prize.description,
            url: award.prize.url,
            recommendedRank: award.prize.recommended_rank,
            eventId: award.prize.event_id,
            eventTitle: award.prize.event_title,
            imageType: award.prize.image_type,
            // Postgres encode() creates RFC 2045 base64 with newlines every 76 characters,
            // Zod doesn't validate that flavor of base64 so we strip the newlines
            imageThumbnailEncoded: award.prize.image_thumbnail?.replace(/\n/g, ''),
          }
        : null,
    })),
  };
};

/**
 * Given a player ID, find their top available award based on their preferences.
 * Returns the highest-priority award that is still available (not assigned to anyone).
 *
 * @param context - The application context
 * @param trx - The Knex transaction to use for querying (ensures transaction isolation)
 * @param playerId - The ID of the player
 * @returns The top available award based on preferences with preference order info, or undefined if none available
 */
export const getTopAvailableAwardForPlayer = async ({
  context,
  trx,
  playerId,
  notInAwardIds,
}: {
  context: Context;
  trx: Knex.Transaction;
  playerId: string;
  notInAwardIds: string[];
}): Promise<
  { award: AwardApi; preferenceOrder?: number | null; fromPreference: boolean } | undefined
> => {
  // Query award preferences ordered by preference_order (ascending)
  // Join with awards to check availability
  // Return the first award that is available (player_id is null)
  const row = await trx(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(
        `CASE
          WHEN ${PLAYER_TABLE_NAME}.id IS NULL THEN NULL
          ELSE CONCAT(${PLAYER_TABLE_NAME}.aga_id, ' - ', ${PLAYER_TABLE_NAME}.name)
        END as player_name`,
      ),
      `${PRIZE_TABLE_NAME}.title as prize_title`,
      `${PRIZE_TABLE_NAME}.description as prize_description`,
      `${AWARD_PREFERENCE_TABLE_NAME}.preference_order as preference_order`,
    )
    .innerJoin(
      AWARD_PREFERENCE_TABLE_NAME,
      `${TABLE_NAME}.id`,
      `${AWARD_PREFERENCE_TABLE_NAME}.award_id`,
    )
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.player_id`, `${PLAYER_TABLE_NAME}.id`)
    .leftJoin(PRIZE_TABLE_NAME, `${TABLE_NAME}.prize_id`, `${PRIZE_TABLE_NAME}.id`)
    .whereNotIn(`${TABLE_NAME}.id`, notInAwardIds) // Exclude specified awards
    .andWhere(`${AWARD_PREFERENCE_TABLE_NAME}.player_id`, playerId)
    .andWhere(`${TABLE_NAME}.player_id`, null) // Only available awards
    .orderBy(`${AWARD_PREFERENCE_TABLE_NAME}.preference_order`, 'asc')
    .first()
    .returning<AwardWithPreferenceDb>('*');

  if (row) {
    return {
      award: asModel(row),
      preferenceOrder: row.preference_order,
      fromPreference: true,
    };
  }

  // If no award found based on preferences, find the next best available award
  // by highest value (descending)
  const fallbackRow = await trx(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(
        `CASE
          WHEN ${PLAYER_TABLE_NAME}.id IS NULL THEN NULL
          ELSE CONCAT(${PLAYER_TABLE_NAME}.aga_id, ' - ', ${PLAYER_TABLE_NAME}.name)
        END as player_name`,
      ),
      `${PRIZE_TABLE_NAME}.title as prize_title`,
      `${PRIZE_TABLE_NAME}.description as prize_description`,
    )
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.player_id`, `${PLAYER_TABLE_NAME}.id`)
    .leftJoin(PRIZE_TABLE_NAME, `${TABLE_NAME}.prize_id`, `${PRIZE_TABLE_NAME}.id`)
    .whereNotIn(`${TABLE_NAME}.id`, notInAwardIds) // Exclude specified awards
    .andWhere(`${TABLE_NAME}.player_id`, null) // Only available awards
    .orderBy(`${TABLE_NAME}.value`, 'desc')
    .first()
    .returning<AwardWithPreferenceDb>('*');

  if (!fallbackRow) {
    return undefined;
  }

  return {
    award: asModel(fallbackRow),
    preferenceOrder: null,
    fromPreference: false,
  };
};
