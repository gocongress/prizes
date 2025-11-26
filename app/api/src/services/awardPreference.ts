import { parseSqlError } from '@/lib/sql';
import {
  create,
  deleteById,
  deleteByPlayer,
  getAll,
  getById,
  updateById,
} from '@/models/awardPreference';
import {
  type AwardPreferenceApi,
  type AwardPreferenceQueryParams,
  type CreateAwardPreference,
  type UpdateAwardPreference,
} from '@/schemas/awardPreference';
import type { ServiceParams } from '@/types';

export const getAllAwardPreference = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: AwardPreferenceQueryParams;
}) => {
  try {
    const context = args.serviceParams.context;
    const { items, ...rest } = await getAll(context, args.queryParams);
    context.logger.info({ ...rest });
    return { items, ...rest };
  } catch (error) {
    throw new Error(parseSqlError(args.serviceParams.context, error));
  }
};

export const getAwardPreferenceById = async ({
  context,
  input,
}: ServiceParams<AwardPreferenceApi['id']>): Promise<AwardPreferenceApi> => {
  try {
    if (!input) {
      throw new Error('Award preference ID is missing.');
    }
    const preference = await getById(context, input);
    if (!preference) {
      throw new Error('Award preference not found.');
    }
    return preference;
  } catch (error) {
    throw new Error(parseSqlError(context, error));
  }
};

export const createAwardPreference = async ({
  context,
  input,
}: ServiceParams<CreateAwardPreference>): Promise<AwardPreferenceApi> => {
  if (!input) {
    throw new Error('Create award preference input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await create(context, trx, input);
    if (!payload) {
      throw new Error('Failed to create award preference.');
    }
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw new Error(parseSqlError(context, error));
  }
};

export const updateAwardPreferenceById = async ({
  context,
  input,
}: ServiceParams<
  UpdateAwardPreference & { id: AwardPreferenceApi['id'] }
>): Promise<AwardPreferenceApi> => {
  if (!input) {
    throw new Error('Update award preference input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await updateById(context, trx, input.id, input);
    if (!payload) {
      throw new Error('Failed to update award preference.');
    }
    await trx.commit();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw new Error(parseSqlError(context, error));
  }
};

export const deleteAwardPreferenceById = async ({
  context,
  input,
}: ServiceParams<AwardPreferenceApi['id']>): Promise<number> => {
  if (!input) {
    throw new Error('Award preference ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const deleted = await deleteById(context, trx, input);
    await trx.commit();
    return deleted;
  } catch (error) {
    await trx.rollback();
    throw new Error(parseSqlError(context, error));
  }
};

export const getAwardPreferencesByPlayer = async (args: {
  serviceParams: ServiceParams<string>;
  queryParams: AwardPreferenceQueryParams;
}) => {
  if (!args.serviceParams.input) {
    throw new Error('Player ID is missing.');
  }
  try {
    const context = args.serviceParams.context;
    args.queryParams.playerId = args.serviceParams.input;
    const { items, ...rest } = await getAll(context, args.queryParams);
    context.logger.info({ ...rest });
    return { items, ...rest };
  } catch (error) {
    throw new Error(parseSqlError(args.serviceParams.context, error));
  }
};

export const syncAwardPreferencesByPlayer = async ({
  context,
  input,
}: ServiceParams<{ items: CreateAwardPreference[] }>) => {
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error('Create award preference input is missing or invalid.');
  }

  await deleteAwardPreferencesByPlayer({ context, input: input.items[0].playerId });

  const trx = await context.db.transaction();
  try {
    const createdPreferences: AwardPreferenceApi[] = [];

    // Create all preferences within the transaction
    for (const preferenceInput of input.items) {
      const payload = await create(context, trx, preferenceInput);
      if (!payload) {
        throw new Error('Failed to create award preference.');
      }
      createdPreferences.push(payload);
    }

    // Only commit if all records were created successfully
    await trx.commit();
    return getAwardPreferencesByPlayer({
      serviceParams: { context, input: input.items[0].playerId },
      queryParams: { orderBy: 'preferenceOrder', orderDirection: 'asc', page: 1, pageSize: 1000 },
    });
  } catch (error) {
    // Rollback all changes if any creation fails
    await trx.rollback();
    throw new Error(parseSqlError(context, error));
  }
};

export const deleteAwardPreferencesByPlayer = async ({
  context,
  input,
}: ServiceParams<string>): Promise<number> => {
  if (!input) {
    throw new Error('Player ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const deleted = await deleteByPlayer(context, trx, input);
    await trx.commit();
    return deleted;
  } catch (error) {
    await trx.rollback();
    throw new Error(parseSqlError(context, error));
  }
};
