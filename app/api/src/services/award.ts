import { create, deleteById, getAll, getById, getByUserPlayerId, updateById } from '@/models/award';
import {
  type AwardApi,
  type AwardQueryParams,
  type AwardWithPrizeApi,
  type CreateAward,
  type UpdateAward,
} from '@/schemas/award';
import type { ServiceParams } from '@/types';
import createHttpError from 'http-errors';

export const getAllAward = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: AwardQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

export const createAward = async ({
  context,
  input,
}: ServiceParams<CreateAward>): Promise<AwardApi> => {
  if (!input) {
    throw new Error('Create award input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const award = await create(context, trx, input);
    if (!award) {
      throw createHttpError(400, 'Award create failed.');
    }
    await trx.commit();
    return award;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getAwardById = async ({
  context,
  input,
}: ServiceParams<AwardApi['id']>): Promise<AwardApi> => {
  if (!input) {
    throw createHttpError(400, 'Award ID is missing.');
  }
  const award = await getById(context, input);
  if (!award) {
    throw createHttpError(404, 'Award invalid or not found.');
  }
  return award;
};

export const updateAwardById = async ({
  context,
  input,
}: ServiceParams<UpdateAward & { id: AwardApi['id'] }>): Promise<AwardApi> => {
  if (!input) {
    throw new Error('Update award input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const award = await updateById(context, trx, input.id, input);
    if (!award) {
      throw createHttpError(404, 'Award invalid or not found.');
    }
    await trx.commit();
    return award;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deleteAwardById = async ({
  context,
  input,
}: ServiceParams<AwardApi['id']>): Promise<number> => {
  if (!input) {
    throw new Error('Award ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const rowsAffected = await deleteById(context, trx, input);
    if (!rowsAffected) {
      throw createHttpError(404, 'Award invalid or not found.');
    }
    await trx.commit();
    return rowsAffected;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getAwardsByPlayerId = async ({
  context,
  input,
}: ServiceParams<{ userId: string; playerId: string }>): Promise<{
  items: AwardWithPrizeApi[];
}> => {
  if (!input) {
    throw createHttpError(400, 'User or Player ID is missing.');
  }

  return getByUserPlayerId(context, input);
};
