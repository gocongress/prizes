import { getWelcomeLinkJwt } from '@/lib/auth';
import { ScopeKinds } from '@/lib/constants';
import { sendWelcomeEmail } from '@/lib/email';
import { ApiPayloadSchema, UuidParamsSchema, buildResponse, handlerFactory } from '@/lib/handlers';
import { TABLE_NAME as PLAYER_TABLE_NAME, getByAgaId } from '@/models/player';
import { TABLE_NAME as REGISTRANT_TABLE_NAME } from '@/models/registrant';
import { TABLE_NAME as USER_TABLE_NAME, getById as getUserById } from '@/models/user';
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
          scope: 'USER' as 'USER' | 'ADMIN',
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

/**
 * POST /api/v1/admin/events/:id/welcome-emails
 * Sends a welcome email to each unique user registered for the event.
 * Users with multiple players in the event receive only one email.
 */
export const sendEventWelcomeEmailsHandler = (context: Context) =>
  handlerFactory({
    context,
    kind: ContextKinds.EVENT,
    itemSchema: WelcomeEmailMessageSchema,
    scopes: ScopeKinds.ADMIN,
    disableScrub: true,
  }).build({
    method: 'post',
    input: UuidParamsSchema,
    output: ApiPayloadSchema,
    handler: async ({ input, options: { context } }) => {
      try {
        const rows = await context
          .db(REGISTRANT_TABLE_NAME)
          .join(PLAYER_TABLE_NAME, `${PLAYER_TABLE_NAME}.id`, `${REGISTRANT_TABLE_NAME}.player_id`)
          .join(USER_TABLE_NAME, `${USER_TABLE_NAME}.id`, `${PLAYER_TABLE_NAME}.user_id`)
          .where(`${REGISTRANT_TABLE_NAME}.event_id`, input.id)
          .whereNull(`${REGISTRANT_TABLE_NAME}.deleted_at`)
          .whereNull(`${PLAYER_TABLE_NAME}.deleted_at`)
          .whereNull(`${USER_TABLE_NAME}.deleted_at`)
          .select(
            `${USER_TABLE_NAME}.id`,
            `${USER_TABLE_NAME}.email`,
            `${USER_TABLE_NAME}.scope`,
            context.db.raw(`CASE WHEN COUNT(??) > 1 THEN '' ELSE MIN(??) END as player_name`, [
              `${PLAYER_TABLE_NAME}.name`,
              `${PLAYER_TABLE_NAME}.name`,
            ]),
          )
          .groupBy(`${USER_TABLE_NAME}.id`, `${USER_TABLE_NAME}.email`, `${USER_TABLE_NAME}.scope`);

        let sent = 0;
        for (const row of rows) {
          const token = getWelcomeLinkJwt(context, {
            id: row.id,
            email: row.email,
            scope: 'USER' as 'USER' | 'ADMIN',
          });
          const loginLink = `${context.runtime.playerAppUrl}/login?token=${token}`;
          await sendWelcomeEmail(context, {
            playerName: row.player_name,
            playerEmail: row.email,
            loginLink,
          });
          sent++;
        }

        context.logger.info({ eventId: input.id, sent }, 'Welcome emails sent for event');

        return buildResponse(WelcomeEmailMessageSchema, context, ContextKinds.EVENT, {
          message: `Welcome emails sent to ${sent} user(s).`,
        });
      } catch (err) {
        if (createHttpError.isHttpError(err)) throw err;
        context.logger.error({ err, eventId: input.id }, 'Error sending welcome emails for event');
        throw createHttpError(500, err as Error, { expose: false });
      }
    },
  });
