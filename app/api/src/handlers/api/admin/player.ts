import {
  ApiPayloadSchema,
  buildResponse,
  createQueryParamsSchema,
  handlerFactory,
  UuidParamsSchema,
} from '@/lib/handlers';
import { ScopeKinds } from '@/lib/handlers/constants';
import {
  PlayerApiSchema,
  PlayerCreateSchema,
  PlayerMessageSchema,
  PlayerQueryKeys,
  PlayerUpdateSchema,
  type PlayerQueryParams,
} from '@/schemas/player';
import * as PlayerService from '@/services/player';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/players?page=2&pageSize=25
 */
export const getAllPlayer = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.PLAYER,
    itemSchema: PlayerApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: createQueryParamsSchema(PlayerQueryKeys),
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await PlayerService.getAllPlayer({
          serviceParams: { context },
          queryParams: input as PlayerQueryParams,
        });
        return buildResponse(PlayerApiSchema, context, ContextKinds.PLAYER, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching players');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/players
 */
export const createPlayer = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    context,
    kind: ContextKinds.PLAYER,
    itemSchema: PlayerApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'post',
    input: PlayerCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PlayerService.createPlayer({ context, input });
        return buildResponse(PlayerApiSchema, context, ContextKinds.PLAYER, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error creating player');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/players/:id
 */
export const getPlayerById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.PLAYER,
    itemSchema: PlayerApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PlayerService.getPlayerById({ context, input: input.id });
        return buildResponse(PlayerApiSchema, context, ContextKinds.PLAYER, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching player');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/players/:id
 */
export const updatePlayerById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.PLAYER,
    itemSchema: PlayerApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(PlayerUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PlayerService.updatePlayerById({ context, input });
        return buildResponse(PlayerApiSchema, context, ContextKinds.PLAYER, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating player');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/players/:id
 */
export const deletePlayerById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.PLAYER,
    itemSchema: PlayerMessageSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const rows = await PlayerService.deletePlayerById({ context, input: input.id });
        return buildResponse(PlayerMessageSchema, context, ContextKinds.PLAYER, {
          message: `${rows} player deleted.`,
        });
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting player');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
