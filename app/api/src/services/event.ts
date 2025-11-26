import { create, deleteById, getAll, getById, updateById } from '@/models/event';
import {
  type CreateEvent,
  type EventApi,
  type EventQueryParams,
  type UpdateEvent,
} from '@/schemas/event';
import type { ServiceParams } from '@/types';

export const getAllEvent = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: EventQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

export const createEvent = async ({
  context,
  input,
}: ServiceParams<CreateEvent>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Create event input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await create(context, trx, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getEventById = async ({
  context,
  input,
}: ServiceParams<EventApi['id']>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Event ID is missing.');
  }
  const event = await getById(context, input);

  return event;
};

export const updateEventById = async ({
  context,
  input,
}: ServiceParams<UpdateEvent & { id: EventApi['id'] }>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Update event input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await updateById(context, trx, input.id, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deleteEventById = async ({
  context,
  input,
}: ServiceParams<EventApi['id']>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Event ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await deleteById(context, trx, input);
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
