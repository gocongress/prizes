import type { Context } from '@/types';
import rateLimit from 'express-rate-limit';
import { defaultEndpointsFactory, Middleware } from 'express-zod-api';
import createHttpError from 'http-errors';
import { createHmac, timingSafeEqual } from 'node:crypto';
import z from 'zod';

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
      output: z.object({ message: z.string(), verified: z.boolean() }),
      handler: async ({ options: { verified } }) => {
        // TODO: Create a service to handle individual regfox data payloads
        return { message: 'OK', verified };
      },
    });

export default handler;
