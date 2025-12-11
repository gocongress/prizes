import { getQueryParams } from '@/lib/handlers';
import {
  PlayerQueryFields,
  PlayerQueryKeys,
  type CreatePlayer,
  type PlayerApi,
  type PlayerDb,
  type PlayerQueryKey,
  type PlayerQueryParams,
  type UpdatePlayer,
} from '@/schemas/player';
import type { UserDb } from '@/schemas/user';
import { ContextKinds, type Context } from '@/types';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { find, TABLE_NAME as USER_TABLE_NAME, getById as userGetById } from './user';

export const TABLE_NAME = 'players';

const asModel = (item: PlayerDb & { email?: UserDb['email'] }): PlayerApi => {
  return {
    id: item.id,
    kind: ContextKinds.PLAYER,
    userId: item.user_id,
    email: item.email,
    agaId: item.aga_id,
    rank: item.rank || undefined,
    name: item.name,
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
  };
};

export const getAll = async (
  context: Context,
  queryParams: PlayerQueryParams,
): Promise<{
  orderBy: PlayerQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: PlayerApi[];
}> => {
  const totalCountResult = await context
    .db<PlayerDb>(TABLE_NAME)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .count<{ count: number }>(`${TABLE_NAME}.id as count`)
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<PlayerQueryKey>(PlayerQueryKeys, queryParams, totalItems);

  // Improve this if future table-joined fields are include in the orderBy
  const orderByTable =
    orderBy === 'email'
      ? `${USER_TABLE_NAME}.email`
      : `${TABLE_NAME}.${PlayerQueryFields[orderBy]}`;

  const rows = await context
    .db<PlayerDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${USER_TABLE_NAME}.email as email`)
    .join(USER_TABLE_NAME, `${USER_TABLE_NAME}.id`, `${TABLE_NAME}.user_id`)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .orderBy(orderByTable, orderDirection)
    .offset(offset)
    .limit(pageSize)
    .returning<(PlayerDb & { email: UserDb['email'] })[]>('*');

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

/*

TODO: MAke an api query by email address

export const findByEmail = async (
  context: Context,
  email: PlayerApi['email'],
  one_time_pass?: string,
): Promise<PlayerApi | undefined> => {
  const query = context.db<PlayerDb>(TABLE_NAME).where({ email, deleted_at: null });

  // Check jsonb column to see if it contains the provided one_time_pass
  if (one_time_pass) {
    query.whereRaw('one_time_passes @> ?', [JSON.stringify([one_time_pass])]);
  }

  const rows = await query.returning<PlayerDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};
*/

export const getById = async (
  context: Context,
  id: PlayerApi['id'],
): Promise<PlayerApi | undefined> => {
  const rows = await context
    .db<PlayerDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${USER_TABLE_NAME}.email as email`)
    .join(USER_TABLE_NAME, `${USER_TABLE_NAME}.id`, `${TABLE_NAME}.user_id`)
    .where(`${TABLE_NAME}.id`, id)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .returning<(PlayerDb & { email: UserDb['email'] })[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const getByAgaId = async (
  context: Context,
  agaId: PlayerApi['agaId'],
): Promise<PlayerApi | undefined> => {
  const rows = await context
    .db<PlayerDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${USER_TABLE_NAME}.email as email`)
    .join(USER_TABLE_NAME, `${USER_TABLE_NAME}.id`, `${TABLE_NAME}.user_id`)
    .where(`${TABLE_NAME}.aga_id`, agaId)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .returning<(PlayerDb & { email: UserDb['email'] })[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: CreatePlayer,
): Promise<PlayerApi | undefined> => {
  const user = input.email
    ? await find(context, input.email)
    : await userGetById(context, input.userId);

  if (!user) {
    return;
  }

  const rows = await trx<PlayerDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      name: input.name,
      aga_id: input.agaId,
      rank: input.rank,
      user_id: user.id,
      created_at: new Date(),
    })
    .returning<PlayerDb[]>('*');

  if (!rows.length) {
    return;
  }

  context.logger.debug({ id: rows[0].id }, 'New player created');
  return asModel({ ...rows[0], email: user.email });
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: PlayerApi['id'],
  input: Partial<UpdatePlayer>,
): Promise<PlayerApi | undefined> => {
  const playerRows = await context
    .db<PlayerDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .returning<PlayerDb[]>('*');

  if (!playerRows.length) {
    return;
  }

  const player = playerRows[0];

  const rows = await trx<PlayerDb>(TABLE_NAME)
    .where({ id })
    .update({
      name: input.name || player.name,
      aga_id: input.agaId || player.aga_id,
      rank: input.rank || player.rank,
      user_id: input.userId || player.user_id,
      updated_at: new Date(),
    })
    .returning<PlayerDb[]>('*');

  if (!rows.length) {
    throw new Error('Failed updating player.');
  }

  const user = await userGetById(context, rows[0].user_id);
  if (!user) {
    return;
  }
  return asModel({ ...rows[0], email: user.email });
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: PlayerApi['id'],
): Promise<PlayerApi | undefined> => {
  const rows = await trx<PlayerDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      // TODO: Rethink full delete users and players
      // deleted_at: new Date(),
    })
    .returning<PlayerDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};
