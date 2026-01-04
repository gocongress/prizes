import { sendSupportEmail } from '@/lib/email';
import { convertStringRankToNumber } from '@/lib/player';
import { getByFormId } from '@/models/event';
import {
  type AgaField,
  type EmailField,
  type NameField,
  type PlayingRankField,
  type RegFoxRegistrantPayload,
  regFoxWebhookPayloadSchema,
  type RegistrantDetails,
} from '@/schemas/regfox';
import { createPlayer } from '@/services/player';
import { createRegistrant } from '@/services/registrant';
import { createUser } from '@/services/user';
import type { Context } from '@/types';
import rateLimit from 'express-rate-limit';
import { defaultEndpointsFactory, Middleware } from 'express-zod-api';
import createHttpError from 'http-errors';
import { createHmac, timingSafeEqual } from 'node:crypto';
import z from 'zod';

export const extractRegistrantDetails = (
  registrant: RegFoxRegistrantPayload,
): RegistrantDetails => {
  const nameField = registrant.data.find((f) => f.type === 'name') as NameField;
  const emailField = registrant.data.find((f) => f.type === 'email') as EmailField;
  const agaField = registrant.data.find((f) => f.key === 'aga') as AgaField;
  const rankField = registrant.data.find((f) => f.key === 'playingRank') as PlayingRankField;

  return {
    firstName: nameField.first.value,
    lastName: nameField.last.value,
    email: emailField.value,
    aga: agaField.value,
    playingRank: rankField.value,
  };
};

const isVerifiedPayload = (context: Context, signature: string, payload: Buffer) => {
  const expected = createHmac('sha256', context.runtime.webhooks.regfox.signingSecret)
    .update(payload)
    .digest('hex');
  context.logger.debug({ expected, signature, webhook: 'regfox' }, 'Payload verification');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const RegFoxMiddleware = (context: Context) =>
  new Middleware({
    handler: async ({ request }) => {
      const verified = isVerifiedPayload(
        context,
        request.headers['x-webconnex-signature'] as string,
        request.rawBody,
      );
      const clientIp = request.ip || request.headers['x-forwarded-for'] || 'unknown';

      if (!verified) {
        context.logger.warn(
          { clientIp, webhook: 'regfox' },
          'Warning: Signature mismatch. This could happen when the RegFox signing key has changed on either side, or when malicious/invalid payloads are being attempted by the client.',
        );
        throw createHttpError(400, 'Invalid payload');
      }
      context.logger.info({ clientIp, webhook: 'regfox' }, 'Handling valid payload.');
      return { verified };
    },
  });

const handler = (context: Context) =>
  defaultEndpointsFactory
    .addMiddleware(RegFoxMiddleware(context))
    .use(
      rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 5, // limit each IP to 5 requests per windowMs
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        identifier: 'webhook-regfix',
        skipSuccessfulRequests: true, // Only rate limit failed requests
      }),
    )
    .build({
      input: regFoxWebhookPayloadSchema,
      output: z.object({ message: z.string(), verified: z.boolean() }),
      handler: async ({ input, options: { verified } }) => {
        context.logger.info(
          {
            eventType: input.eventType,
            formName: input.data.formName,
            orderNumber: input.data.orderNumber,
            registrantCount: input.data.registrants.length,
          },
          'Processing RegFox webhook',
        );

        const registrants = input.data.registrants.map(extractRegistrantDetails);
        context.logger.debug({ registrants }, 'Extracted registrant details');

        for (const registrant of registrants) {
          try {
            // Create user (or get existing user), do not email users created from the
            // webhook yet.
            // TODO: Should brand new users get a welcome email and a code from the Prizes app?
            const user = await createUser({
              context,
              input: { email: registrant.email },
              sendEmail: false,
            });

            context.logger.info(
              { userId: user.id, email: registrant.email },
              'User created or retrieved',
            );

            // Convert playing rank to integer
            const rank = convertStringRankToNumber(registrant.playingRank);

            // Create player (or get existing player)
            const player = await createPlayer({
              context,
              input: {
                userId: user.id,
                agaId: registrant.aga,
                name: `${registrant.firstName} ${registrant.lastName}`,
                rank,
              },
            });

            context.logger.info(
              { playerId: player.id, agaId: registrant.aga, userId: user.id },
              'Player created or retrieved',
            );

            // Find the event to register the player as a registrant
            if (input.formId) {
              const event = await getByFormId(context, input.formId.toString());

              context.logger.info(
                { eventId: event.id, formId: input.data.formId },
                'Event retrieved by form ID',
              );

              await createRegistrant({
                context,
                input: {
                  eventId: event.id,
                  playerId: player.id,
                  registrationDate: new Date().toISOString(),
                },
              });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            context.logger.error(
              {
                error: errorMessage,
                registrant,
              },
              'Failed to create user or player for registrant',
            );
            await sendSupportEmail(context, { errorMessage, jsonData: registrant as any });
          }
        }

        return { message: 'OK', verified };
      },
    });

export default handler;
