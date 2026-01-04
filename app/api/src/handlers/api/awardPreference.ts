import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import { ScopeKinds } from '@/lib/handlers/constants';
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
 * Currently unused
 * DELETE /api/v1/awardPreferences/player/:id
 */
export const deleteAwardPreferencesByPlayer = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: AwardPreferenceApiSchema.extend({ playerId: z.guid() }),
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.deleteAwardPreferences({
          context,
          input: { playerId: input.id },
        });
        return buildResponse(AwardPreferenceDeleteSchema, context, ContextKinds.AWARD_PREFERENCE, {
          message: `${payload} award preferences deleted.`,
        });
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error deleting award preference');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
