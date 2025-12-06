import { ApiPayloadSchema, buildResponse, handlerFactory, UuidParamsSchema } from '@/lib/handlers';
import { ScopeKinds } from '@/lib/handlers/constants';
import { AwardWithPrizeListApiSchema } from '@/schemas/award';
import { UserCreateSchema, UserMinimalDetailsSchema } from '@/schemas/user';
import * as AwardService from '@/services/award';
import * as UserService from '@/services/user';
import { ContextKinds, type Context } from '@/types';
import rateLimit from 'express-rate-limit';
import createHttpError from 'http-errors';

/**
 * POST /api/v1/users
 */
export const createUser = (context: Context) =>
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
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 5, // limit each IP to 5 requests per windowMs
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        identifier: 'user-registration',
      }),
    )
    .build({
      method: 'post',
      input: UserCreateSchema,
      output: ApiPayloadSchema,
      handler: async ({ input, options: { context } }) => {
        try {
          const payload = await UserService.createUser({ context, input });
          const { oneTimePass, ...rest } = payload;
          return buildResponse(UserMinimalDetailsSchema, context, ContextKinds.USER, {
            ...rest,
            isAdmin: payload.scope === 'ADMIN',
          });
        } catch (err) {
          context.logger.error({ err }, 'Error creating user');
          throw createHttpError(500, err as Error, { expose: false });
        }
      },
    });

/**
 * GET /api/v1/users/awards/player/{id}
 */
export const getUserAwards = (context: Context) =>
  handlerFactory({
    kind: ContextKinds.AWARD,
    scopes: ScopeKinds.USER,
    context,
    itemSchema: AwardWithPrizeListApiSchema,
  }).build({
    method: 'get',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ options: { context }, input }) => {
      try {
        // Get the currently logged in user's player ID from JWT payload
        const userId = context.request?.jwtPayload?.sub as string | undefined;

        if (!userId) {
          throw createHttpError(401, 'User ID is missing.');
        }

        const payload = await AwardService.getAwardsByPlayerId({
          context,
          input: { userId, playerId: input.id },
        });

        return buildResponse(AwardWithPrizeListApiSchema, context, ContextKinds.AWARD, payload);
      } catch (err) {
        context.logger.error({ err }, 'Error fetching user awards');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
