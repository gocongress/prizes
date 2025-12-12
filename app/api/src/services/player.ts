import { deleteByPlayer } from '@/models/awardPreference';
import { create, deleteById, getAll, getById, updateById } from '@/models/player';
import {
  type CreatePlayer,
  type PlayerApi,
  type PlayerQueryParams,
  type UpdatePlayer,
} from '@/schemas/player';
import type { Context, ServiceParams } from '@/types';
import createHttpError from 'http-errors';
import { type JwtPayload } from 'jsonwebtoken';

export const getAllPlayer = async (args: {
  serviceParams: ServiceParams<void>;
  queryParams: PlayerQueryParams;
}) => {
  const context = args.serviceParams.context;
  const { items, ...rest } = await getAll(context, args.queryParams);
  context.logger.info({ ...rest });
  return { items, ...rest };
};

export const createPlayer = async ({
  context,
  input,
}: ServiceParams<CreatePlayer>): Promise<PlayerApi> => {
  if (!input) {
    throw new Error('Create player input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const player = await create(context, trx, input);
    if (!player) {
      throw createHttpError(400, 'Player create failed.');
    }
    await trx.commit();
    return player;
  } catch (error) {
    await trx.rollback();
    if ((error as Error).message.includes('players_lower_aga_id_unique')) {
      throw createHttpError(400, `Player with AGA ID ${input.agaId} already exists.`);
    }
    throw error;
  }
};

export const getPlayerById = async ({
  context,
  input,
}: ServiceParams<PlayerApi['id']>): Promise<PlayerApi> => {
  if (!input) {
    throw createHttpError(400, 'Player ID is missing.');
  }
  const player = await getById(context, input);
  if (!player) {
    throw createHttpError(404, 'Player invalid or not found.');
  }
  return player;
};

export const updatePlayerById = async ({
  context,
  input,
}: ServiceParams<UpdatePlayer & { id: PlayerApi['id'] }>): Promise<PlayerApi> => {
  if (!input) {
    throw new Error('Update player input is missing.');
  }

  const trx = await context.db.transaction();
  try {
    const player = await updateById(context, trx, input.id, input);
    if (!player) {
      throw createHttpError(404, 'Player invalid or not found.');
    }
    await trx.commit();
    return player;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const deletePlayerById = async ({
  context,
  input,
}: ServiceParams<PlayerApi['id']>): Promise<number> => {
  if (!input) {
    throw new Error('Player ID is missing.');
  }

  const trx = await context.db.transaction();
  try {
    // Delete this players award preferences first
    await deleteByPlayer(context, trx, input);
    const rows = await deleteById(context, trx, input);
    if (!rows) {
      throw createHttpError(404, 'Player invalid or not found.');
    }
    await trx.commit();
    return rows;
  } catch (error) {
    await trx.rollback();
    if ((error as any).detail?.includes('is still referenced')) {
      throw new Error('Cannot delete a player who has been awarded prizes.');
    }
    throw error;
  }
};

export const getJwtPlayer = async (
  context: Context,
  payload: JwtPayload,
): Promise<{ player: PlayerApi }> => {
  if (!payload.sub) {
    context.logger.error(
      'JWT provided to player service is missing "sub" property intended to be the player.id',
    );
    throw new Error('Malformed JWT payload, unable to authenticate player.');
  }
  const player = await getPlayerById({ context, input: payload.sub });
  return { player };
};
