import { getQueryParams } from '@/lib/handlers';
import { TABLE_NAME as AWARD_TABLE_NAME } from '@/models/award';
import { TABLE_NAME as PRIZE_TABLE_NAME } from '@/models/prize';
import type { AwardDb } from '@/schemas/award';
import {
  AwardPreferenceQueryFields,
  AwardPreferenceQueryKeys,
  type AwardPreferenceApi,
  type AwardPreferenceDb,
  type AwardPreferenceQueryKey,
  type AwardPreferenceQueryParams,
  type CreateAwardPreference,
  type UpdateAwardPreference,
} from '@/schemas/awardPreference';
import type { EventApi } from '@/schemas/event';
import { ContextKinds, type Context } from '@/types';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';

export const TABLE_NAME = 'award_preferences';

const asModel = (
  item: AwardPreferenceDb & { awardValue?: AwardDb['value'] },
): AwardPreferenceApi => {
  return {
    id: item.id,
    kind: ContextKinds.AWARD_PREFERENCE,
    playerId: item.player_id,
    awardId: item.award_id,
    awardValue: item.awardValue,
    prizeId: item.prize_id,
    preferenceOrder: item.preference_order,
    createdAt: item.created_at.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
  };
};

export const getAll = async (
  context: Context,
  queryParams: AwardPreferenceQueryParams,
): Promise<{
  orderBy: AwardPreferenceQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: AwardPreferenceApi[];
}> => {
  const totalCountResult = await context
    .db<AwardPreferenceDb>(TABLE_NAME)
    .count<{ count: number }>('id as count')
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');

  const query = context
    .db<AwardPreferenceDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .select(`${AWARD_TABLE_NAME}.value as awardValue`)
    .leftJoin(AWARD_TABLE_NAME, `${TABLE_NAME}.award_id`, `${AWARD_TABLE_NAME}.id`);

  if (queryParams.playerId) {
    query.where(`${TABLE_NAME}.player_id`, queryParams.playerId);
  }

  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<AwardPreferenceQueryKey>(AwardPreferenceQueryKeys, queryParams, totalItems);

  const orderByTable = `${TABLE_NAME}.${AwardPreferenceQueryFields[orderBy]}`;

  const rows = await query
    .orderByRaw(
      `
      ${orderByTable} ${orderDirection},
      ${TABLE_NAME}.player_id asc,
      ${TABLE_NAME}.preference_order asc
    `,
    )
    .offset(offset)
    .limit(pageSize);

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
  id: AwardPreferenceApi['id'],
): Promise<AwardPreferenceApi | undefined> => {
  const rows = await context
    .db<AwardPreferenceDb>(TABLE_NAME)
    .where({ id })
    .returning<AwardPreferenceDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: CreateAwardPreference,
): Promise<AwardPreferenceApi | undefined> => {
  const awardRows = await trx<AwardDb>(AWARD_TABLE_NAME)
    .where({ id: input.awardId })
    .returning<AwardDb[]>('*');
  if (!awardRows.length) {
    throw new Error('Malformed award preference, invalid award.');
  }

  const rows = await trx<AwardPreferenceDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      player_id: input.playerId,
      award_id: awardRows[0].id,
      prize_id: awardRows[0].prize_id!,
      preference_order: input.preferenceOrder,
      created_at: new Date(),
    })
    .returning<AwardPreferenceDb[]>('*');

  if (!rows.length) {
    return;
  }

  context.logger.debug({ id: rows[0].id }, 'New award preference created');
  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: AwardPreferenceApi['id'],
  input: Partial<UpdateAwardPreference>,
): Promise<AwardPreferenceApi | undefined> => {
  const preferenceRows = await context
    .db<AwardPreferenceDb>(TABLE_NAME)
    .where({ id })
    .returning<AwardPreferenceDb[]>('*');

  if (!preferenceRows.length) {
    return;
  }

  const rows = await trx<AwardPreferenceDb>(TABLE_NAME)
    .where({ id })
    .update({
      updated_at: new Date(),
      preference_order: input.preferenceOrder ?? preferenceRows[0].preference_order,
    })
    .returning<AwardPreferenceDb[]>('*');

  if (!rows.length) {
    throw new Error('Failed updating award preference.');
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: AwardPreferenceApi['id'],
): Promise<number> => trx<AwardPreferenceDb>(TABLE_NAME).where({ id }).del();

// Delete all award preferences for a given player, used when deleting a player in the admin API
export const deleteByPlayer = async (
  _context: Context,
  trx: Knex.Transaction,
  { playerId }: { playerId: AwardPreferenceApi['playerId'] },
): Promise<number> => trx<AwardPreferenceDb>(TABLE_NAME).where({ player_id: playerId }).del();

export const deleteByPlayerAndEvent = async (
  _context: Context,
  trx: Knex.Transaction,
  { playerId, eventId }: { playerId: AwardPreferenceApi['playerId']; eventId: EventApi['id'] },
): Promise<number> =>
  trx<AwardPreferenceDb>(TABLE_NAME)
    .whereIn(
      'id',
      trx<AwardPreferenceDb>(TABLE_NAME)
        .select(`${TABLE_NAME}.id`)
        .join(PRIZE_TABLE_NAME, `${TABLE_NAME}.prize_id`, `${PRIZE_TABLE_NAME}.id`)
        .where(`${TABLE_NAME}.player_id`, playerId)
        .andWhere(`${PRIZE_TABLE_NAME}.event_id`, eventId),
    )
    .del();
