import {
  create,
  deleteById,
  getAll,
  getByFormId,
  getById,
  getBySlug,
  updateById,
} from '@/models/event';
import { getByUserId as getPlayersByUserId } from '@/models/player';
import {
  create as createRegistrant,
  deleteById as deleteRegistrant,
  getByPlayerAndEvent,
} from '@/models/registrant';
import {
  type CreateEvent,
  type EventApi,
  type EventQueryParams,
  type UpdateEvent,
} from '@/schemas/event';
import type { RegistrantApi } from '@/schemas/registrant';
import type { ServiceParams } from '@/types';
import createHttpError from 'http-errors';

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

export const getEventBySlug = async ({
  context,
  input,
}: ServiceParams<EventApi['slug']>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Event slug is missing.');
  }
  const event = await getBySlug(context, input);

  return event;
};

export const getEventByFormId = async ({
  context,
  input,
}: ServiceParams<EventApi['registrationFormId']>): Promise<EventApi> => {
  if (!input) {
    throw new Error('Event registration form ID is missing.');
  }
  const event = await getByFormId(context, input);

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

export const selfRegisterForEvent = async ({
  context,
  input,
}: ServiceParams<{ eventId: EventApi['id']; playerId: string; userId: string }>): Promise<RegistrantApi> => {
  if (!input) {
    throw createHttpError(400, 'Self-registration input is missing.');
  }

  const { eventId, playerId, userId } = input;

  // Get the event and verify self-registration is enabled
  const event = await getById(context, eventId);
  if (!event.selfRegistrationEnabled) {
    throw createHttpError(403, 'Self-registration is not enabled for this event.');
  }

  // Verify the player belongs to the user
  const players = await getPlayersByUserId(context, userId);
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw createHttpError(403, 'You can only register players that belong to your account.');
  }

  // Check if already registered
  const existingRegistration = await getByPlayerAndEvent(context, playerId, eventId);
  if (existingRegistration) {
    throw createHttpError(400, 'Player is already registered for this event.');
  }

  const trx = await context.db.transaction();
  try {
    const registrant = await createRegistrant(context, trx, {
      playerId,
      eventId,
      registrationDate: new Date().toISOString(),
      status: 'self-registered',
    });
    if (!registrant) {
      throw createHttpError(400, 'Failed to create registration.');
    }
    await trx.commit();
    return registrant;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const selfUnregisterFromEvent = async ({
  context,
  input,
}: ServiceParams<{ eventId: EventApi['id']; playerId: string; userId: string }>): Promise<RegistrantApi> => {
  if (!input) {
    throw createHttpError(400, 'Self-unregistration input is missing.');
  }

  const { eventId, playerId, userId } = input;

  // Get the event and verify self-registration is enabled
  const event = await getById(context, eventId);
  if (!event.selfRegistrationEnabled) {
    throw createHttpError(403, 'Self-registration is not enabled for this event.');
  }

  // Verify the player belongs to the user
  const players = await getPlayersByUserId(context, userId);
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw createHttpError(403, 'You can only unregister players that belong to your account.');
  }

  // Find the existing registration
  const existingRegistration = await getByPlayerAndEvent(context, playerId, eventId);
  if (!existingRegistration) {
    throw createHttpError(404, 'Player is not registered for this event.');
  }

  const trx = await context.db.transaction();
  try {
    const registrant = await deleteRegistrant(context, trx, existingRegistration.id);
    if (!registrant) {
      throw createHttpError(400, 'Failed to remove registration.');
    }
    await trx.commit();
    return registrant;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
