import { getQueryParams } from '@/lib/handlers';
import {
  EventQueryFields,
  EventQueryKeys,
  type CreateEvent,
  type EventApi,
  type EventDb,
  type EventQueryKey,
  type EventQueryParams,
  type UpdateEvent,
} from '@/schemas/event';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';

export const TABLE_NAME = 'events';

const asModel = (item: EventDb): EventApi => {
  return {
    id: item.id,
    kind: ContextKinds.EVENT,
    title: item.title,
    slug: item.slug,
    description: item.description,
    startAt: item.start_at.toISOString(),
    endAt: item.end_at.toISOString(),
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
  };
};

export const getAll = async (
  context: Context,
  queryParams: EventQueryParams,
): Promise<{
  orderBy: EventQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: EventApi[];
}> => {
  const totalCountResult = await context
    .db<EventDb>(TABLE_NAME)
    .where('deleted_at', null)
    .count<{ count: number }>('id as count')
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<EventQueryKey>(EventQueryKeys, queryParams, totalItems);

  const rows = await context
    .db<EventDb>(TABLE_NAME)
    .where('deleted_at', null)
    .orderBy(EventQueryFields[orderBy], orderDirection)
    .offset(offset)
    .limit(pageSize)
    .returning<EventDb[]>('*');

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

export const getById = async (context: Context, id: EventApi['id']): Promise<EventApi> => {
  const rows = await context
    .db<EventDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .returning<EventDb[]>('*');

  if (!rows.length) {
    throw createHttpError(404, `Event ${id} not found.`);
  }

  return asModel(rows[0]);
};

export const getBySlug = async (context: Context, slug: EventApi['slug']): Promise<EventApi> => {
  if (!slug) {
    throw createHttpError(400, `Event slug is required.`);
  }

  const rows = await context
    .db<EventDb>(TABLE_NAME)
    .where({ slug, deleted_at: null })
    .returning<EventDb[]>('*');

  if (!rows.length) {
    throw createHttpError(404, `Event with slug ${slug} not found.`);
  }

  return asModel(rows[0]);
};

export const create = async (
  _context: Context,
  trx: Knex.Transaction,
  input: Partial<CreateEvent>,
): Promise<EventApi> => {
  const rows = await trx<EventDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      title: input.title,
      slug: input.slug,
      description: input.description ?? undefined,
      start_at: new Date(input.startAt!),
      end_at: new Date(input.endAt!),
      created_at: new Date(),
    })
    .returning<EventDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, 'Created Event not returned.');
  }

  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: EventApi['id'],
  input: Partial<UpdateEvent>,
): Promise<EventApi> => {
  const event = await getById(context, id);
  const { title, slug, description, startAt, endAt } = input;

  const rows = await trx<EventDb>(TABLE_NAME)
    .where({ id })
    .update({
      title: title ?? event.title,
      slug: slug ?? event.slug!,
      description,
      start_at: new Date(startAt ?? event.startAt),
      end_at: new Date(endAt ?? event.endAt),
      updated_at: new Date(),
    })
    .returning<EventDb[]>('*');

  if (!rows.length) {
    throw createHttpError(400, `Updated Event ${id} not returned.`);
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  _context: Context,
  trx: Knex.Transaction,
  id: EventApi['id'],
): Promise<EventApi> => {
  const rows = await trx<EventDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: new Date(),
    })
    .returning<EventDb[]>('*');

  if (!rows.length) {
    throw createHttpError(404, `Event ${id} not found.`);
  }

  return asModel(rows[0]);
};
