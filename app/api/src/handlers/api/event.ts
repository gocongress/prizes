import { cacheMiddleware } from '@/lib/cache';
import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  EventApiSchema,
  EventQuerySchema,
  EventSlugParamsSchema,
  type EventQueryParams,
} from '@/schemas/event';
import { RegistrantApiSchema } from '@/schemas/registrant';
import * as EventService from '@/services/event';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import z from 'zod';

/**
 * GET /api/v1/events?page=0&pageSize=25
 * Public endpoint - no authentication required
 * Returns only upcoming events (end_at >= now)
 */
export const getAllEvents = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.USER,
    authenticateUser: false,
    context,
    itemSchema: EventApiSchema,
  })
    .use(cacheMiddleware(context))
    .build({
      method: 'get',
      input: EventQuerySchema,
      output: ApiPayloadSchema,
      handler: async ({ options: { context }, input }) => {
        try {
          const payload = await EventService.getAllEvent({
            serviceParams: { context },
            queryParams: input as EventQueryParams,
          });

          // Filter to only upcoming events (where end_at >= now)
          const now = new Date();
          const upcomingEvents = {
            ...payload,
            items: payload.items.filter((event) => new Date(event.endAt) >= now),
            totalItems: payload.items.filter((event) => new Date(event.endAt) >= now).length,
          };

          return buildResponse(EventApiSchema, context, ContextKinds.EVENT, upcomingEvents);
        } catch (err) {
          context.logger.error({ err }, 'Error fetching events');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });

/**
 * GET /api/v1/events/:id
 * Public endpoint - no authentication required
 */
export const getEventById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.USER,
    authenticateUser: false,
    context,
    itemSchema: EventApiSchema,
  })
    .use(cacheMiddleware(context))
    .build({
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
 * GET /api/v1/events/slug/:slug
 * Public endpoint - no authentication required
 * Returns an event by its unique slug
 */
export const getEventBySlug = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.EVENT,
    scopes: ScopeKinds.USER,
    authenticateUser: false,
    context,
    itemSchema: EventApiSchema,
  })
    .use(cacheMiddleware(context))
    .build({
      method: 'get',
      input: EventSlugParamsSchema,
      output: ApiPayloadSchema,
      handler: async ({ input, options: { context } }) => {
        try {
          const payload = await EventService.getEventBySlug({ context, input: input.slug });
          return buildResponse(EventApiSchema, context, ContextKinds.EVENT, payload);
        } catch (err) {
          context.logger.error({ err, slug: input.slug }, 'Error fetching event by slug');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });

/**
 * POST /api/v1/events/:id/register/:playerId
 * Authenticated endpoint - allows a user to self-register their player for an event
 */
export const selfRegisterForEvent = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.REGISTRANT,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: RegistrantApiSchema,
  }).build({
    method: 'post',
    input: z.object({ id: z.guid(), playerId: z.guid() }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const userId = context.request?.jwtPayload?.sub as string | undefined;
        if (!userId) {
          throw createHttpError(401, 'Authentication required.');
        }

        const payload = await EventService.selfRegisterForEvent({
          context,
          input: { eventId: input.id, playerId: input.playerId, userId },
        });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        if (err instanceof createHttpError.HttpError) {
          throw err;
        }
        context.logger.error(
          { err, eventId: input.id, playerId: input.playerId },
          'Error self-registering for event',
        );
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/events/:id/register/:playerId
 * Authenticated endpoint - allows a user to self-unregister their player from an event
 */
export const selfUnregisterFromEvent = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.REGISTRANT,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: RegistrantApiSchema,
  }).build({
    method: 'delete',
    input: z.object({ id: z.guid(), playerId: z.guid() }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const userId = context.request?.jwtPayload?.sub as string | undefined;
        if (!userId) {
          throw createHttpError(401, 'Authentication required.');
        }

        const payload = await EventService.selfUnregisterFromEvent({
          context,
          input: { eventId: input.id, playerId: input.playerId, userId },
        });
        return buildResponse(RegistrantApiSchema, context, ContextKinds.REGISTRANT, payload);
      } catch (err) {
        if (err instanceof createHttpError.HttpError) {
          throw err;
        }
        context.logger.error(
          { err, eventId: input.id, playerId: input.playerId },
          'Error self-unregistering from event',
        );
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
