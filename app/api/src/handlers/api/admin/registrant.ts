import {
  ApiPayloadSchema,
  buildResponse,
  createQueryParamsSchema,
  handlerFactory,
  UuidParamsSchema,
} from '@/lib/handlers';
import { ScopeKinds } from '@/lib/handlers/constants';
import {
  RegistrantApiSchema,
  RegistrantCreateSchema,
  RegistrantMessageSchema,
  RegistrantQueryKeys,
  RegistrantUpdateSchema,
  type RegistrantQueryParams,
} from '@/schemas/registrant';
import * as RegistrantService from '@/services/registrant';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/registrants?page=2&pageSize=25
 */
export const getAllRegistrant = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.REGISTRANT,
    itemSchema: RegistrantApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: createQueryParamsSchema(RegistrantQueryKeys),
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await RegistrantService.getAllRegistrant({
          serviceParams: { context },
          queryParams: input as RegistrantQueryParams,
        });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching registrants');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/registrants
 */
export const createRegistrant = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    context,
    kind: ContextKinds.REGISTRANT,
    itemSchema: RegistrantApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'post',
    input: RegistrantCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await RegistrantService.createRegistrant({ context, input });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error creating registrant');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/registrants/:id
 */
export const getRegistrantById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.REGISTRANT,
    itemSchema: RegistrantApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await RegistrantService.getRegistrantById({ context, input: input.id });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching registrant');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/registrants/:id
 */
export const updateRegistrantById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.REGISTRANT,
    itemSchema: RegistrantApiSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(RegistrantUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await RegistrantService.updateRegistrantById({ context, input });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating registrant');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/registrants/:id
 */
export const deleteRegistrantById = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.REGISTRANT,
    itemSchema: RegistrantMessageSchema,
    scopes: ScopeKinds.ADMIN,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        await RegistrantService.deleteRegistrantById({ context, input: input.id });
        return buildResponse(RegistrantMessageSchema, context, ContextKinds.REGISTRANT, {
          message: 'Registrant deleted.',
        });
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting registrant');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
