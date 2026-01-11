import { ScopeKinds } from '@/lib/constants';
import {
  ApiPayloadSchema,
  buildResponse,
  createQueryParamsSchema,
  handlerFactory,
  UuidParamsSchema,
} from '@/lib/handlers';
import {
  AwardApiSchema,
  AwardCreateSchema,
  AwardDeleteSchema,
  AwardListApiSchema,
  AwardQueryKeys,
  AwardUpdateSchema,
  type AwardQueryParams,
} from '@/schemas/award';
import * as AwardService from '@/services/award';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/awards?page=2&pageSize=25
 */
export const getAllAward = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.AWARD,
    itemSchema: AwardListApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: createQueryParamsSchema(AwardQueryKeys),
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await AwardService.getAllAward({
          serviceParams: { context },
          queryParams: input as AwardQueryParams,
        });
        return buildResponse(AwardListApiSchema, context, ContextKinds.AWARD, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching awards');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/awards
 */
export const createAward = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    context,
    kind: ContextKinds.AWARD,
    itemSchema: AwardApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'post',
    input: AwardCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardService.createAward({ context, input });
        return buildResponse(AwardApiSchema, context, ContextKinds.AWARD, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error creating award');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/awards/:id
 */
export const getAwardById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.AWARD,
    itemSchema: AwardApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardService.getAwardById({ context, input: input.id });
        return buildResponse(AwardApiSchema, context, ContextKinds.AWARD, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching award');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/awards/:id
 */
export const updateAwardById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.AWARD,
    itemSchema: AwardApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(AwardUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardService.updateAwardById({ context, input });
        return buildResponse(AwardApiSchema, context, ContextKinds.AWARD, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating award');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/awards/:id
 */
export const deleteAwardById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.AWARD,
    itemSchema: AwardDeleteSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const recordsAffected = await AwardService.deleteAwardById({ context, input: input.id });
        if (!recordsAffected) {
          throw createHttpError(400, 'Award not deleted.');
        }
        return buildResponse(AwardDeleteSchema, context, ContextKinds.AWARD, {
          message: `Award ${input.id} deleted.`,
        });
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting award');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
