import { create, deleteById, getAll, getById, updateById } from '@/models/registrant';
import {
  type CreateRegistrant,
  type RegistrantApi,
  type RegistrantQueryParams,
  type UpdateRegistrant,
} from '@/schemas/registrant';
import type { ServiceParams } from '@/types';
import createHttpError from 'http-errors';

export const getAllRegistrant = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: RegistrantQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

export const createRegistrant = async ({
  context,
  input,
}: ServiceParams<CreateRegistrant>): Promise<RegistrantApi> => {
  if (!input) {
    throw new Error('Create registrant input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const registrant = await create(context, trx, input);
    if (!registrant) {
      throw createHttpError(400, 'Registrant create failed.');
    }
    await trx.commit();
    return registrant;
  } catch (error) {
    await trx.rollback();
    if ((error as Error).message.includes('unique_player_event')) {
      throw createHttpError(
        400,
        `Registrant already exists for this player and event combination.`,
      );
    }
    if ((error as Error).message.includes('foreign key')) {
      throw createHttpError(400, 'Invalid player ID or event ID.');
    }
    throw error;
  }
};

export const getRegistrantById = async ({
  context,
  input,
}: ServiceParams<RegistrantApi['id']>): Promise<RegistrantApi> => {
  if (!input) {
    throw createHttpError(400, 'Registrant ID is missing.');
  }
  const registrant = await getById(context, input);
  if (!registrant) {
    throw createHttpError(404, 'Registrant invalid or not found.');
  }
  return registrant;
};

export const updateRegistrantById = async ({
  context,
  input,
}: ServiceParams<UpdateRegistrant & { id: RegistrantApi['id'] }>): Promise<RegistrantApi> => {
  if (!input) {
    throw new Error('Update registrant input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const registrant = await updateById(context, trx, input.id, input);
    if (!registrant) {
      throw createHttpError(404, 'Registrant invalid or not found.');
    }
    await trx.commit();
    return registrant;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deleteRegistrantById = async ({
  context,
  input,
}: ServiceParams<RegistrantApi['id']>): Promise<RegistrantApi> => {
  if (!input) {
    throw new Error('Registrant ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const registrant = await deleteById(context, trx, input);
    if (!registrant) {
      throw createHttpError(404, 'Registrant invalid or not found.');
    }
    await trx.commit();
    return registrant;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
