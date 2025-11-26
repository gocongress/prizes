import {
  ApiPayloadSchema,
  buildResponse,
  createQueryParamsSchema,
  handlerFactory,
  UuidParamsSchema,
} from '@/lib/handlers';
import { ScopeKinds } from '@/lib/handlers/constants';
import {
  AllocateAwardsSchema,
  AllocationRecommendationsSchema,
  ResultApiSchema,
  ResultCreateSchema,
  ResultImportApiSchema,
  ResultImportSchema,
  ResultQueryKeys,
  ResultUpdateSchema,
  type ResultQueryParams,
} from '@/schemas/result';
import * as ResultService from '@/services/result';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import * as z from 'zod';

/**
 * GET /api/v1/admin/results?page=2&pageSize=25
 */
export const getAllResult = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: 'get',
    input: createQueryParamsSchema(ResultQueryKeys),
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await ResultService.getAllResult({
          serviceParams: { context },
          queryParams: input as ResultQueryParams,
        });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching results');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/results
 */
export const createResult = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: 'post',
    input: ResultCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.createResult({ context, input });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error creating result');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/results/:id
 */
export const getResultById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.getResultById({ context, input: input.id });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching result');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/results/event/:eventId
 */
export const getResultByEventId = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: 'get',
    input: z.object({ eventId: z.string().uuid() }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.getResultByEventId({ context, input: input.eventId });
        if (!payload) {
          throw createHttpError(404, `Result for event ${input.eventId} not found.`);
        }
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err, eventId: input.eventId }, 'Error fetching result by event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/results/:id
 */
export const updateResultById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(ResultUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.updateResultById({ context, input });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating result');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/results/:id
 */
export const deleteResultById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.RESULT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: ResultApiSchema,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.deleteResultById({ context, input: input.id });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting result');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/results/import
 */
export const importResults = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.RESULT,
    itemSchema: ResultImportApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'post',
    input: ResultImportSchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        await ResultService.bulkSyncResults(context, input);
        return buildResponse(ResultImportApiSchema, context, ContextKinds.RESULT, {
          message: 'Imported',
        });
      } catch (err) {
        context.logger.error({ err }, 'Error importing results');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/results/:id/allocateAwards
 * Returns allocation recommendations without actually allocating
 */
export const getAllocationRecommendations = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.RESULT,
    itemSchema: AllocationRecommendationsSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.getAllocationRecommendations({
          context,
          input: input.id,
        });
        return buildResponse(
          AllocationRecommendationsSchema,
          context,
          ContextKinds.RESULT,
          payload,
        );
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error getting allocation recommendations');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/results/:id/allocateAwards
 * Accepts client-modified allocations and finalizes them
 */
export const allocateAwardsToWinners = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.RESULT,
    itemSchema: ResultApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'post',
    input: UuidParamsSchema.extend({ awards: AllocateAwardsSchema }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.allocateAwardsToWinners({
          context,
          input: { id: input.id, awards: input.awards },
        });
        return buildResponse(ResultApiSchema, context, ContextKinds.RESULT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error allocating awards to winners');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/results/:id/deallocate-awards
 * Returns deallocation recommendations without actually deallocating
 */
export const getDeallocationRecommendations = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.RESULT,
    itemSchema: AllocationRecommendationsSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await ResultService.deallocateAwardsFromResult({
          context,
          input: input.id,
        });
        return buildResponse(
          AllocationRecommendationsSchema,
          context,
          ContextKinds.RESULT,
          payload,
        );
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error getting deallocation recommendations');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
