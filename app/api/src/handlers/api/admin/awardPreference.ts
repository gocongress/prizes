import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import {
  AwardPreferenceApiSchema,
  AwardPreferenceCreateSchema,
  AwardPreferenceDeleteSchema,
  AwardPreferenceListApiSchema,
  AwardPreferenceQuerySchema,
  AwardPreferenceUpdateSchema,
  type AwardPreferenceQueryParams,
} from '@/schemas/awardPreference';
import * as AwardPreferenceService from '@/services/awardPreference';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import * as z from 'zod';

/**
 * GET /api/v1/admin/awardPreferences?page=0&pageSize=10&player_id={playerId}
 */
export const getAllAwardPreference = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceListApiSchema,
    disableScrub: true,
  }).build({
    method: 'get',
    input: AwardPreferenceQuerySchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        const payload = await AwardPreferenceService.getAllAwardPreference({
          serviceParams: { context },
          queryParams: input as AwardPreferenceQueryParams,
        });
        return buildResponse(
          AwardPreferenceListApiSchema,
          context,
          ContextKinds.AWARD_PREFERENCE,
          payload,
        );
      } catch (err) {
        context.logger.error({ err }, 'Error fetching award preferences');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/awardPreferences/:id
 */
export const getAwardPreferenceById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceApiSchema,
    disableScrub: true,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.getAwardPreferenceById({
          context,
          input: input.id,
        });
        return buildResponse(
          AwardPreferenceApiSchema,
          context,
          ContextKinds.AWARD_PREFERENCE,
          payload,
        );
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error fetching award preference');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/admin/awardPreferences/player/:playerId
 */
export const getAwardPreferencesByPlayer = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceListApiSchema,
    disableScrub: true,
  }).build({
    method: 'get',
    input: AwardPreferenceQuerySchema.extend({ playerId: z.guid() }),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.getAwardPreferencesByPlayer({
          serviceParams: { context, input: input.playerId },
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
 * POST /api/v1/admin/awardPreferences
 */
export const createAwardPreference = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceApiSchema,
    disableScrub: true,
  }).build({
    method: 'post',
    input: AwardPreferenceCreateSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.createAwardPreference({ context, input });
        return buildResponse(
          AwardPreferenceApiSchema,
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
 * PUT/PATCH /api/v1/admin/awardPreferences/:id
 */
export const updateAwardPreferenceById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceApiSchema,
    disableScrub: true,
  }).build({
    method: ['put', 'patch'],
    input: UuidParamsSchema.extend(AwardPreferenceUpdateSchema.shape),
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.updateAwardPreferenceById({ context, input });
        return buildResponse(
          AwardPreferenceApiSchema,
          context,
          ContextKinds.AWARD_PREFERENCE,
          payload,
        );
      } catch (err) {
        context.logger.error({ err, id: input.id }, 'Error updating award preference');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * DELETE /api/v1/admin/awardPreferences/:id
 */
export const deleteAwardPreferenceById = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD_PREFERENCE,
    scopes: ScopeKinds.ADMIN,
    context,
    itemSchema: AwardPreferenceApiSchema,
    disableScrub: true,
  }).build({
    method: 'delete',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const payload = await AwardPreferenceService.deleteAwardPreferenceById({
          context,
          input: input.id,
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
