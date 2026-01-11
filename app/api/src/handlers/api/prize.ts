import { cacheMiddleware } from '@/lib/cache';
import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  PrizeListUserApiSchema,
  PrizeQuerySchema,
  PrizeUserApiSchema,
  type PrizeQueryParams,
} from '@/schemas/prize';
import * as PrizeService from '@/services/prize';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';

/**
 * GET /api/v1/prizes?page=2&pageSize=25
 */
export const getAllPrize = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.USER,
    authenticateUser: false,
    context,
    itemSchema: PrizeListUserApiSchema, // Minimized response payload appropriate for non-admin users
  })
    .use(cacheMiddleware(context))
    .build({
      method: 'get',
      input: PrizeQuerySchema,
      output: ApiPayloadSchema,
      handler: async ({ options: { context }, input }) => {
        try {
          const payload = await PrizeService.getAllPrize({
            serviceParams: { context },
            queryParams: input as PrizeQueryParams,
          });
          return buildResponse(PrizeListUserApiSchema, context, ContextKinds.PRIZE, payload);
        } catch (err) {
          context.logger.error({ err }, 'Error fetching prizes');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });

/**
 * GET /api/v1/prizes/:id
 */
export const getPrizeById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.PRIZE,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: PrizeUserApiSchema, // Minimized response payload appropriate for non-admin users
  })
    .use(cacheMiddleware(context))
    .build({
      method: 'get',
      input: UuidParamsSchema,
      output: ApiPayloadSchema,
      handler: async ({ input, options: { context } }) => {
        try {
          const payload = await PrizeService.getPrizeById({ context, input: input.id });
          return buildResponse(PrizeUserApiSchema, context, ContextKinds.PRIZE, payload);
        } catch (err) {
          context.logger.error({ err, id: input.id }, 'Error fetching prize');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });
