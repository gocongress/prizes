import { ScopeKinds } from '@/lib/constants';
import { ApiPayloadSchema, buildResponse, handlerFactory } from '@/lib/handlers';
import {
  UserLoginSchema,
  UserMessageSchema,
  UserMinimalDetailsSchema,
  UserProfileSchema,
} from '@/schemas/user';
import * as UserService from '@/services/user';
import { ContextKinds, type Context } from '@/types';
import rateLimit from 'express-rate-limit';
import createHttpError from 'http-errors';

/**
 * POST /api/v1/auth/login
 */
export const loginUser = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    useBotProtection: true,
    context,
    kind: ContextKinds.USER,
    itemSchema: UserMinimalDetailsSchema,
    scopes: ScopeKinds.USER,
  })
    .use(
      rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // limit each IP to 5 requests per windowMs
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        identifier: 'user-login',
      }),
    )
    .build({
      method: 'post',
      input: UserLoginSchema,
      output: ApiPayloadSchema,
      handler: async ({ input, options: { context } }) => {
        try {
          const payload = await UserService.loginUser({ context, input });
          if (!payload.token) {
            throw createHttpError(500, 'User login failed, token not generated.');
          }
          const { oneTimePass, ...rest } = payload;
          return buildResponse(UserMinimalDetailsSchema, context, ContextKinds.USER, {
            ...rest,
            isAdmin: payload.scope === 'ADMIN',
          });
        } catch (err) {
          context.logger.error({ err }, 'Error logging in user');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });

/**
 * POST /api/v1/auth/logout
 */
export const logoutUser = (context: Context) =>
  handlerFactory({
    authenticateUser: false,
    context,
    kind: ContextKinds.USER,
    itemSchema: UserMessageSchema,
    scopes: ScopeKinds.USER,
    clearCookie: true,
  }).build({
    method: 'post',
    output: ApiPayloadSchema,
    handler: async ({ options: { context } }) => {
      try {
        return buildResponse(UserMessageSchema, context, ContextKinds.USER, {
          message: 'User logged out.',
        });
      } catch (err) {
        context.logger.error({ err }, 'Error logging out user');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });

/**
 * GET /api/v1/auth/profile
 */
export const userProfile = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: UserProfileSchema,
    scopes: ScopeKinds.USER,
  })
    // TODO: re-add caching with user-specific cache keys
    // .use(cacheMiddleware(context, 60000))
    .build({
      method: 'get',
      output: ApiPayloadSchema,
      handler: async ({ options: { context, user } }) => {
        try {
          if (
            !context.request?.token ||
            !context.request?.jwtPayload ||
            context.request?.jwtPayload.sub !== user?.id
          ) {
            throw createHttpError(400, 'Unauthorized');
          }

          const payload = await UserService.getUserProfile({ context, input: user!.id });
          return buildResponse(UserProfileSchema, context, ContextKinds.USER, {
            ...payload,
            isAdmin: payload.scope === 'ADMIN',
          });
        } catch (err) {
          context.logger.error({ err }, 'Error fetching user profile');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });
