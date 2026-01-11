import { ScopeKinds } from '@/lib/constants';
import {
  ApiPayloadSchema,
  buildResponse,
  createQueryParamsSchema,
  handlerFactory,
  UuidParamsSchema,
} from '@/lib/handlers';
import {
  EventApiSchema,
  EventCreateSchema,
  EventQueryKeys,
  EventUpdateSchema,
  type EventQueryParams,
} from '@/schemas/event';
import * as EventService from '@/services/event';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/admin/events?page=2&pageSize=25
 */
export const getAllEvent = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: EventApiSchema,
  }).build({
    method: 'get',
    input: createQueryParamsSchema(EventQueryKeys),
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await EventService.getAllEvent({
          serviceParams: { context },
          queryParams: input as EventQueryParams,
        });
        return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching events');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/admin/events
 */
export const createEvent = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: EventApiSchema,
  }).build({
    method: 'post',
    input: EventCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await EventService.createEvent({ context, input });
        return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error creating event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/events/:id
 */
export const getEventById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: EventApiSchema,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await EventService.getEventById({ context, input: input.id });
        return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * PUT /api/v1/admin/events/:id
 */
export const updateEventById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: EventApiSchema,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(EventUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await EventService.updateEventById({ context, input });
        return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/events/:id
 */
export const deleteEventById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: EventApiSchema,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await EventService.deleteEventById({ context, input: input.id });
        return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
