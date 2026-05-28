import { getWelcomeLinkJwt } from '@/lib/auth';
import { ScopeKinds } from '@/lib/constants';
import { sendWelcomeEmail } from '@/lib/email';
import { ApiPayloadSchema, buildResponse, handlerFactory } from '@/lib/handlers';
import { getByAgaId } from '@/models/player';
import { getById as getUserById } from '@/models/user';
import { ContextKinds, type Context } from '@/types';
import createHttpError from 'http-errors';
import * as z from 'zod';

const WelcomeEmailInputSchema = z.object({
  agaId: z.string().min(1),
});

const WelcomeEmailMessageSchema = z.object({
  message: z.string(),
});

/**
 * POST /api/v1/admin/users/welcome-email
 */
export const sendWelcomeEmailHandler = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.USER,
    itemSchema: WelcomeEmailMessageSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'post',
    input: WelcomeEmailInputSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const player = await getByAgaId(context, input.agaId);
        if (!player) {
          throw createHttpError(404, `Player with AGA ID "${input.agaId}" not found.`, {
            expose: true,
          });
        }

        const user = await getUserById(context, player.userId);
        if (!user) {
          throw createHttpError(404, `User associated with AGA ID "${input.agaId}" not found.`, {
            expose: true,
          });
        }

        const token = getWelcomeLinkJwt(context, {
          id: user.id,
          email: user.email,
          scope: user.scope as 'USER' | 'ADMIN',
        });

        const loginLink = `${context.runtime.playerAppUrl}/login?token=${token}`;

        await sendWelcomeEmail(context, {
          playerName: player.name,
          playerEmail: user.email,
          loginLink,
        });

        context.logger.info({ agaId: input.agaId, userId: user.id }, 'Welcome email sent');

        return buildResponse(WelcomeEmailMessageSchema, context, ContextKinds.USER, {
          message: 'Welcome email sent.',
        });
      } catch (err) {
        if (createHttpError.isHttpError(err)) throw err;
        context.logger.error({ err, agaId: input.agaId }, 'Error sending welcome email');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
