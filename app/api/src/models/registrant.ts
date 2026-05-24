import { getQueryParams } from '@/lib/handlers';
import {
  RegistrantQueryFields,
  RegistrantQueryKeys,
  type CreateRegistrant,
  type RegistrantApi,
  type RegistrantDb,
  type RegistrantQueryKey,
  type RegistrantQueryParams,
  type UpdateRegistrant,
} from '@/schemas/registrant';
import { ContextKinds, type Context } from '@/types';
import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { TABLE_NAME as EVENT_TABLE_NAME } from './event';
import { TABLE_NAME as PLAYER_TABLE_NAME } from './player';

export const TABLE_NAME = 'registrants';

const asModel = (
  item: RegistrantDb & {
    player_name?: string;
    event_title?: string;
  },
): RegistrantApi => {
  return {
    id: item.id,
    kind: ContextKinds.REGISTRANT,
    playerId: item.player_id,
    eventId: item.event_id,
    playerName: item.player_name,
    eventTitle: item.event_title,
    registrationDate: item.registration_date.toISOString(),
    status: item.status || undefined,
    notes: item.notes || undefined,
    createdAt: item.created_at.toISOString(),
    deletedAt: item.deleted_at?.toISOString(),
    updatedAt: item.updated_at?.toISOString(),
  };
};

export const getAll = async (
  context: Context,
  queryParams: RegistrantQueryParams,
): Promise<{
  orderBy: RegistrantQueryKey;
  orderDirection: 'asc' | 'desc';
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentItemCount: number;
  items: RegistrantApi[];
}> => {
  const totalCountResult = await context
    .db<RegistrantDb>(TABLE_NAME)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .count<{ count: number }>(`${TABLE_NAME}.id as count`)
    .first();

  const totalItems = Number.parseInt(totalCountResult?.count.toString() ?? '0');
  const { page, pageSize, orderBy, orderDirection, offset, totalPages } =
    getQueryParams<RegistrantQueryKey>(RegistrantQueryKeys, queryParams, totalItems);

  const query = context
    .db<RegistrantDb>(TABLE_NAME)
    .select(
      `${TABLE_NAME}.*`,
      context.db.raw(
        `CASE
          WHEN ${PLAYER_TABLE_NAME}.id IS NULL THEN NULL
          ELSE CONCAT(${PLAYER_TABLE_NAME}.aga_id, ' - ', ${PLAYER_TABLE_NAME}.name)
        END as player_name`,
      ),
      `${EVENT_TABLE_NAME}.title as event_title`,
    )
    .leftJoin(PLAYER_TABLE_NAME, `${TABLE_NAME}.player_id`, `${PLAYER_TABLE_NAME}.id`)
    .leftJoin(EVENT_TABLE_NAME, `${TABLE_NAME}.event_id`, `${EVENT_TABLE_NAME}.id`)
    .where(`${TABLE_NAME}.deleted_at`, null);

  if (queryParams.ids) {
    query.whereIn(`${TABLE_NAME}.id`, queryParams.ids);
  }

  if (queryParams?.q) {
    query.andWhere((subQuery) => {
      subQuery
        .whereILike(`${PLAYER_TABLE_NAME}.name`, `%${queryParams.q}%`)
        .orWhereILike(`${EVENT_TABLE_NAME}.title`, `%${queryParams.q}%`);
    });
  }

  // Improve this if future table-joined fields are included in the orderBy
  let orderByTable;
  switch (orderBy) {
    case 'playerName':
      orderByTable = `${PLAYER_TABLE_NAME}.name`;
      break;
    case 'eventTitle':
      orderByTable = `${EVENT_TABLE_NAME}.title`;
      break;

    default:
      orderByTable = `${TABLE_NAME}.${RegistrantQueryFields[orderBy]}`;
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
  id: RegistrantApi['id'],
): Promise<RegistrantApi | undefined> => {
  const rows = await context
    .db<RegistrantDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .where(`${TABLE_NAME}.id`, id)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .returning<RegistrantDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const getByPlayerAndEvent = async (
  context: Context,
  playerId: RegistrantApi['playerId'],
  eventId: RegistrantApi['eventId'],
): Promise<RegistrantApi | undefined> => {
  const rows = await context
    .db<RegistrantDb>(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .where(`${TABLE_NAME}.player_id`, playerId)
    .where(`${TABLE_NAME}.event_id`, eventId)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .returning<RegistrantDb[]>('*');

  if (!rows.length) {
    return;
  }

  return asModel(rows[0]);
};

export const create = async (
  context: Context,
  trx: Knex.Transaction,
  input: CreateRegistrant,
): Promise<RegistrantApi | undefined> => {
  const rows = await trx<RegistrantDb>(TABLE_NAME)
    .insert({
      id: randomUUID(),
      player_id: input.playerId,
      event_id: input.eventId,
      registration_date: input.registrationDate ? new Date(input.registrationDate) : new Date(),
      status: input.status || null,
      notes: input.notes || null,
      created_at: new Date(),
    })
    .returning<RegistrantDb[]>('*');

  if (!rows.length) {
    return;
  }

  context.logger.debug({ id: rows[0].id }, 'New registrant created');
  return asModel(rows[0]);
};

export const updateById = async (
  context: Context,
  trx: Knex.Transaction,
  id: RegistrantApi['id'],
  input: Partial<UpdateRegistrant>,
): Promise<RegistrantApi | undefined> => {
  const registrantRows = await context
    .db<RegistrantDb>(TABLE_NAME)
    .where({ id, deleted_at: null })
    .returning<RegistrantDb[]>('*');

  if (!registrantRows.length) {
    return;
  }

  const registrant = registrantRows[0];

  const rows = await trx<RegistrantDb>(TABLE_NAME)
    .where({ id })
    .update({
      registration_date: input.registrationDate
        ? new Date(input.registrationDate)
        : registrant.registration_date,
      status: input.status !== undefined ? input.status : registrant.status,
      notes: input.notes !== undefined ? input.notes : registrant.notes,
      updated_at: new Date(),
    })
    .returning<RegistrantDb[]>('*');

  if (!rows.length) {
    throw new Error('Failed updating registrant.');
  }

  return asModel(rows[0]);
};

export const deleteById = async (
  context: Context,
  trx: Knex.Transaction,
  id: RegistrantApi['id'],
): Promise<RegistrantApi | undefined> => {
  const rows = await trx<RegistrantDb>(TABLE_NAME)
    .where({ id })
    .update({
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .returning<RegistrantDb[]>('*');

  if (!rows.length) {
    return;
  }

  context.logger.debug({ id: rows[0].id }, 'Registrant soft deleted');
  return asModel(rows[0]);
};
