import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  AwardPreferenceApiSchema,
  AwardPreferenceCreateSchema,
  AwardPreferenceDeleteSchema,
  AwardPreferenceListApiSchema,
  AwardPreferenceQuerySchema,
  type AwardPreferenceQueryParams,
} from '@/schemas/awardPreference';
import * as AwardPreferenceService from '@/services/awardPreference';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import z from 'zod';

/**
 * GET /api/v1/awardPreferences/player/:id
 */
export const getAwardPreferencesByPlayer = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: AwardPreferenceListApiSchema,
  }).build({
    method: 'get',
    input: UuidParamsSchema.extend(AwardPreferenceQuerySchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.getAwardPreferencesByPlayer({
          serviceParams: { context, input: input.id },
          queryParams: input as AwardPreferenceQueryParams,
        });
        return buildResponse(
          AwardPreferenceListApiSchema,
          context,
          ContextKinds.AWARD_PREFERENCE,
          payload,
        );
      } catch (err) {
        context.logger.error(
          { err, playerId: input.playerId },
          'Error fetching player preferences',
        );
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * POST /api/v1/awardPreferences/player/:id
 */
export const createAwardPreferences = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: AwardPreferenceListApiSchema,
  }).build({
    method: 'post',
    input: z.object({ eventId: z.guid(), items: z.array(AwardPreferenceCreateSchema) }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.syncAwardPreferences({
          context,
          input,
        });
        return buildResponse(
          AwardPreferenceListApiSchema,
          context,
          ContextKinds.AWARD_PREFERENCE,
          payload,
        );
      } catch (err) {
        context.logger.error({ err }, 'Error creating award preference');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/awardPreferences/player/:id/event/:eventId
 */
export const deleteAwardPreferencesByPlayerAndEvent = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: AwardPreferenceApiSchema.extend({ playerId: z.guid(), eventId: z.guid() }),
  }).build({
    method: 'delete',
    input: z.object({ id: z.guid(), eventId: z.guid() }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.deleteAwardPreferences({
          context,
          input: { playerId: input.id, eventId: input.eventId },
        });
        return buildResponse(AwardPreferenceDeleteSchema, context, ContextKinds.AWARD_PREFERENCE, {
          message: `${payload} award preferences deleted.`,
        });
      } catch (err) {
        context.logger.error(
          { err, playerId: input.id, eventId: input.eventId },
          'Error deleting award preferences',
        );
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
