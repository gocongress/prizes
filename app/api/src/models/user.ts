import { randomID } from '@/lib/crypto';
import { getQueryParams } from '@/lib/handlers';
import { TABLE_NAME as PLAYER_TABLE_NAME } from '@/models/player';
import type { PlayerApi, PlayerDb } from '@/schemas/player';
import {
  UserQueryFields,
  UserQueryKeys,
  type CreateUser,
  type UpdateUser,
  type UserApi,
  type UserDb,
  type UserQueryKey,
  type UserQueryParams,
} from '@/schemas/user';
import { ContextKinds, type Context } from '@/types';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';

export const TABLE_NAME = 'users';

type UserWithPlayers = UserDb & {
  players?: PlayerDb[];
};

/**
 * Postgres query to capture the user, and an array of related player records;
 * ie. { id, email, ..., player[] }
 */
const userWithPlayersQuery = (context: Context) => {
  const query = context
    .db<UserDb>(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id',         ${PLAYER_TABLE_NAME}.id,
              'name',       ${PLAYER_TABLE_NAME}.name,
              'rank',       ${PLAYER_TABLE_NAME}.rank,
              'user_id',    ${PLAYER_TABLE_NAME}.user_id,
              'aga_id',     ${PLAYER_TABLE_NAME}.aga_id,
              'created_at', ${PLAYER_TABLE_NAME}.created_at,
              'deleted_at', ${PLAYER_TABLE_NAME}.deleted_at,
              'updated_at', ${PLAYER_TABLE_NAME}.updated_at
            ) ORDER BY ${PLAYER_TABLE_NAME}.rank DESC
          ) FILTER (WHERE ${PLAYER_TABLE_NAME}.id IS NOT NULL), '[]'::json
        ) as "players"
      `),
    )
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.id`, `${PLAYER_TABLE_NAME}.user_id`)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .groupBy(`${TABLE_NAME}.id`);

  return query;
};

const asModel = (item: UserWithPlayers): UserApi => {
  return {
    id: item.id,
    email: item.email,
    kind: ContextKinds.USER,
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
    lastLoginAt: item.last_login_at?.toISOString(),
    scope: item.scope,
    oneTimePass:
      typeof item.one_time_passes === 'string'
        ? JSON.parse(item.one_time_passes)
        : Array.isArray(item.one_time_passes)
          ? item.one_time_passes
          : [],
    players: item.players?.map(
      (p) =>
        ({
          id: p.id,
          agaId: p.aga_id,
          userId: p.user_id,
          kind: ContextKinds.PLAYER,
          name: p.name,
          rank: p.rank || undefined,
          createdAt: new Date(p.created_at).toISOString(),
          deletedAt: p.deleted_at ? new Date(p.deleted_at).toISOString() : undefined,
          updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
        }) satisfies PlayerApi,
    ),
  };
};

export const getAll = async (
  context: Context,
  queryParams: UserQueryParams,
): Promise<{
  orderBy: UserQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: UserApi[];
}> => {
  const totalCountResult = await context
    .db<UserDb>(TABLE_NAME)
    .where('deleted_at', null)
    .count<{ count: number }>('id as count')
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<UserQueryKey>(UserQueryKeys, queryParams, totalItems);
  const q = queryParams.q;

  const query = context.db<UserDb>(TABLE_NAME).where('deleted_at', null);
  if (q) {
    query.andWhereILike('email', `%${q}%`);
  }

  const rows = await query
    .orderBy(UserQueryFields[orderBy], orderDirection)
    .offset(offset)
    .limit(pageSize)
    .returning<UserDb[]>('*');

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

export const find = async (
  context: Context,
  email: UserApi['email'],
  one_time_pass?: string,
): Promise<UserApi | undefined> => {
  const query = context.db<UserDb>(TABLE_NAME).where({ email, deleted_at: null });

  // Check jsonb column to see if it contains the provided one_time_pass
  if (one_time_pass) {
    query.whereRaw('one_time_passes @> ?', [JSON.stringify([one_time_pass])]);
  }

  const rows = await query.returning<UserDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const getById = async (
  context: Context,
  id: UserApi['id'],
): Promise<UserApi | undefined> => {
  const rows = await context
    .db<UserDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .returning<UserDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const getProfile = async (
  context: Context,
  id: UserApi['id'],
): Promise<UserApi | undefined> => {
  // TODO: On all model queries, catch and log postgres errors but don't pass the message up to the handler
  const rows = await userWithPlayersQuery(context).andWhere(`${TABLE_NAME}.id`, id);

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: Partial<CreateUser>,
): Promise<UserApi | undefined> => {
  const one_time_pass = randomID();
  const rows = await trx<UserDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      email: input.email,
      created_at: new Date(),
      one_time_passes: JSON.stringify([one_time_pass]),
    })
    .returning<UserDb[]>('*');

  if (!rows.length) {
    return;
  }

  if (context.env !== 'production') {
    context.logger.info(
      { email: input.email, one_time_pass },
      'Created new user with one-time password',
    );
  }
  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: UserApi['id'],
  input: Partial<
    UpdateUser & {
      last_login_at?: Date;
      clear_one_time_passes?: boolean;
      add_one_time_pass?: string;
    }
  >,
): Promise<UserApi | undefined> => {
  const userRows = await context
    .db<UserDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .returning<UserDb[]>('*');

  if (!userRows.length) {
    return;
  }

  // Add the new one_time_passes to the existing ones to allow for multiple valid passes
  // these will be cleared once one of the passes is used to login.
  // TODO: Consider storing these as an array of objects with { pass, expires_at } for better safety
  const user = userRows[0];

  let one_time_passes: string[] =
    typeof user.one_time_passes === 'string'
      ? JSON.parse(user.one_time_passes)
      : user.one_time_passes || [];
  if (input.add_one_time_pass) {
    try {
      one_time_passes.unshift(input.add_one_time_pass);
      one_time_passes = one_time_passes.slice(0, 5); // Limit to 5 active passes
    } catch (error) {
      one_time_passes = [input.add_one_time_pass];
    }
  }
  if (input.clear_one_time_passes) {
    one_time_passes = [];
  }

  const rows = await trx<UserDb>(TABLE_NAME)
    .where({ id })
    .update({
      updated_at: new Date(),
      one_time_passes: JSON.stringify(one_time_passes),
      last_login_at: input.last_login_at,
      scope: input.scope,
    })
    .returning<UserDb[]>('*');

  if (!rows.length) {
    throw new Error('Failed updating user.');
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: UserApi['id'],
): Promise<UserApi | undefined> => {
  const rows = await trx<UserDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      // TODO: Rethink full delete users/players
      // deleted_at: new Date(),
      one_time_passes: JSON.stringify([]),
    })
    .returning<UserDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};
