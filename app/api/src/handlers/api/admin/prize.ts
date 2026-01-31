import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  PrizeApiSchema,
  PrizeCreateSchema,
  PrizeListApiSchema,
  PrizeQuerySchema,
  PrizeUpdateSchema,
  type PrizeQueryParams,
} from '@/schemas/prize';
import * as PrizeService from '@/services/prize';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/prizes?page=2&pageSize=25
 */
export const getAllPrize = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: PrizeListApiSchema,
    disableScrub: true,
  }).build({
    method: 'get',
    input: PrizeQuerySchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await PrizeService.getAllPrize({
          serviceParams: { context },
          queryParams: input as PrizeQueryParams,
        });
        return buildResponse(PrizeListApiSchema, context, ContextKinds.PRIZE, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching prizes');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/prizes
 */
export const createPrize = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: PrizeApiSchema,
    disableScrub: true,
  }).build({
    method: 'post',
    input: PrizeCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PrizeService.createPrize({ context, input });
        const { imageEncoded, imageThumbnailEncoded, ...rest } = payload;
        return buildResponse(PrizeApiSchema, context, ContextKinds.PRIZE, rest);
      } catch (err) {
        context.logger.error({ err }, 'Error creating prize');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/prizes/:id
 */
export const getPrizeById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: PrizeApiSchema,
    disableScrub: true,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PrizeService.getPrizeById({ context, input: input.id });
        return buildResponse(PrizeApiSchema, context, ContextKinds.PRIZE, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching prize');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/prizes/:id
 */
export const updatePrizeById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: PrizeApiSchema,
    disableScrub: true,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(PrizeUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PrizeService.updatePrizeById({ context, input });
        const { imageEncoded, imageThumbnailEncoded, ...rest } = payload;
        return buildResponse(PrizeApiSchema, context, ContextKinds.PRIZE, rest);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating prize');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/prizes/:id
 */
export const deletePrizeById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: PrizeApiSchema,
    disableScrub: true,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await PrizeService.deletePrizeById({ context, input: input.id });
        const { imageEncoded, imageThumbnailEncoded, ...rest } = payload;
        return buildResponse(PrizeApiSchema, context, ContextKinds.PRIZE, rest);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting prize');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
