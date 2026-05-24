import { resetCache } from '@/lib/cache';
import { syncPrizeImages } from '@/lib/sync-prize-images';
import { create, deleteById, getAll, getById, updateById } from '@/models/prize';
import {
  type CreatePrize,
  type PrizeApi,
  type PrizeQueryParams,
  type UpdatePrize,
} from '@/schemas/prize';
import type { ServiceParams } from '@/types';

export const getAllPrize = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: PrizeQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  const itemsWithoutImages = items.map((item) => {
    const { imageEncoded, ...restPrize } = item;
    return restPrize;
  });
  return { items: itemsWithoutImages, ...rest };
};

export const createPrize = async ({
  context,
  input,
}: ServiceParams<CreatePrize>): Promise<PrizeApi> => {
  if (!input) {
    throw new Error('Create prize input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await create(context, trx, input);
    await trx.commit();
    await syncPrizeImages(context, payload.id);
    await resetCache();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getPrizeById = async ({
  context,
  input,
}: ServiceParams<PrizeApi['id']>): Promise<PrizeApi> => {
  if (!input) {
    throw new Error('Prize ID is missing.');
  }
  const prize = await getById(context, input);

  return prize;
};

export const updatePrizeById = async ({
  context,
  input,
}: ServiceParams<UpdatePrize & { id: PrizeApi['id'] }>): Promise<PrizeApi> => {
  if (!input) {
    throw new Error('Update prize input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await updateById(context, trx, input.id, input);
    await trx.commit();
    await syncPrizeImages(context, payload.id);
    await resetCache();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deletePrizeById = async ({
  context,
  input,
}: ServiceParams<PrizeApi['id']>): Promise<PrizeApi> => {
  if (!input) {
    throw new Error('Prize ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const payload = await deleteById(context, trx, input);
    await trx.commit();
    await resetCache();
    return payload;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
