import { getQueryParams } from '@/lib/handlers';
import { TABLE_NAME as EVENT_TABLE_NAME } from '@/models/event';
import { type EventApi } from '@/schemas/event';
import {
  ResultQueryFields,
  ResultQueryKeys,
  type CreateResult,
  type ResultApi,
  type ResultDb,
  type ResultQueryKey,
  type ResultQueryParams,
  type UpdateResult,
} from '@/schemas/result';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';

export const TABLE_NAME = 'results';

const asModel = (item: ResultDb & { event_title?: EventApi['title'] }): ResultApi => {
  return {
    id: item.id,
    kind: ContextKinds.RESULT,
    eventId: item.event_id,
    eventTitle: item.event_title,
    winners: item.winners as unknown as ResultApi['winners'],
    awards: item.awards as unknown as ResultApi['awards'],
    allocationLockedAt: item.allocation_locked_at?.toISOString(),
    allocationFinalizedAt: item.allocation_finalized_at?.toISOString(),
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
  };
};

export const getAll = async (
  context: Context,
  queryParams: ResultQueryParams,
): Promise<{
  orderBy: ResultQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: ResultApi[];
}> => {
  const totalCountResult = await context
    .db<ResultDb>(TABLE_NAME)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .count<{ count: number }>('id as count')
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<ResultQueryKey>(ResultQueryKeys, queryParams, totalItems);

  const query = context
    .db<ResultDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${EVENT_TABLE_NAME}.title as event_title`)
    .leftJoin(EVENT_TABLE_NAME, `${TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .where(`${TABLE_NAME}.deleted_at`, null);

  if (queryParams.ids) {
    query.whereIn(`${TABLE_NAME}.id`, queryParams.ids);
  }

  const rows = await query
    .orderBy(`${TABLE_NAME}.${ResultQueryFields[orderBy]}`, orderDirection)
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

export const getById = async (context: Context, id: ResultApi['id']): Promise<ResultApi> => {
  const rows = await context
    .db<ResultDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${EVENT_TABLE_NAME}.title as event_title`)
    .leftJoin(EVENT_TABLE_NAME, `${TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .where({ [`${TABLE_NAME}.id`]: id, [`${TABLE_NAME}.deleted_at`]: null });

  if (!rows.length) {
    throw createHttpError(404, `Result ${id} not found.`);
  }

  return asModel(rows[0]);
};

export const getByEventId = async (
  context: Context,
  eventId: ResultApi['eventId'],
): Promise<ResultApi | undefined> => {
  const rows = await context
    .db<ResultDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, `${EVENT_TABLE_NAME}.title as event_title`)
    .leftJoin(EVENT_TABLE_NAME, `${TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .where({ [`${TABLE_NAME}.event_id`]: eventId, [`${TABLE_NAME}.deleted_at`]: null });

  if (!rows.length) {
    return undefined;
  }

  return asModel(rows[0]);
};

export const create = async (
  _context: Context,
  trx: Knex.Transaction,
  input: Partial<CreateResult>,
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      event_id: input.eventId,
      winners: JSON.stringify(input.winners ?? []),
      awards: JSON.stringify([]),
      created_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, 'Created Result not returned.');
  }

  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
  input: Partial<UpdateResult>,
): Promise<ResultApi> => {
  const result = await getById(context, id);
  const { winners } = input;

  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id })
    .update({
      winners: JSON.stringify(winners ?? result.winners),
      updated_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Updated Result ${id} not returned.`);
  }

  return asModel(rows[0]);
};

export const updateAwardsById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
  awards: ResultApi['awards'],
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id })
    .update({
      awards: JSON.stringify(awards),
      updated_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Updated Result ${id} not returned.`);
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(404, `Result ${id} not found.`);
  }

  return asModel(rows[0]);
};

/**
 * Checks if there are any other results with active allocation locks (locked but not finalized).
 * Used to prevent concurrent allocation across different results.
 */
export const hasActiveAllocationLock = async (
  context: Context,
  excludeResultId?: ResultApi['id'],
): Promise<boolean> => {
  const query = context
    .db<ResultDb>(TABLE_NAME)
    .whereNotNull('allocation_locked_at')
    .whereNull('allocation_finalized_at')
    .whereNull('deleted_at');

  if (excludeResultId) {
    query.whereNot('id', excludeResultId);
  }

  const result = await query.count<{ count: number }>('id as count').first();
  return Number.parseInt(result?.count.toString() ?? '0') > 0;
};

/**
 * Locks allocation for a result by setting the allocation_locked_at timestamp.
 * This prevents other results from allocating awards.
 */
export const lockAllocation = async (
  _context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id })
    .update({
      allocation_locked_at: new Date(),
      updated_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Result ${id} not found for locking.`);
  }

  return asModel(rows[0]);
};

/**
 * Finalizes allocation for a result by setting the allocation_finalized_at timestamp.
 * This marks the allocation as complete and releases the lock.
 */
export const finalizeAllocation = async (
  _context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id })
    .update({
      allocation_finalized_at: new Date(),
      allocation_locked_at: null,
      updated_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Result ${id} not found for finalizing.`);
  }

  return asModel(rows[0]);
};

/**
 * Clears finalization for a result, allowing it to be reallocated.
 */
export const clearFinalization = async (
  _context: Context,
  trx: Knex.Transaction,
  id: ResultApi['id'],
): Promise<ResultApi> => {
  const rows = await trx<ResultDb>(TABLE_NAME)
    .where({ id })
    .update({
      allocation_locked_at: null,
      allocation_finalized_at: null,
      updated_at: new Date(),
    })
    .returning<ResultDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Result ${id} not found for clearing finalization.`);
  }

  return asModel(rows[0]);
};
