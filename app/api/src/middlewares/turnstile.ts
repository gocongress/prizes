import type { EndpointOptions } from '@/lib/handlers/helpers';
import type { Context } from '@/types';
import { Middleware, type FlatObject } from 'express-zod-api';
import createHttpError from 'http-errors';

// In-memory cache for verified tokens
const verifiedTokens = new Map<string, number>();

// Cache cleanup interval - remove tokens older than 5 minutes, Cloudflare Turnstile tokens are single-use and expire quickly
const CACHE_TTL_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000; // Run cleanup every minute

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of verifiedTokens.entries()) {
    if (now - timestamp > CACHE_TTL_MS) {
      verifiedTokens.delete(token);
    }
  }
}, CLEANUP_INTERVAL_MS);

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile token with the siteverify API
 * @param token - The Turnstile token to verify
 * @param secret - The Cloudflare Turnstile secret key
 * @param timeout - Request timeout in milliseconds
 * @returns Promise that resolves to true if valid, false otherwise
 */
const verifyTurnstileToken = async (
  token: string,
  secret: string,
  timeout: number,
): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as TurnstileResponse;
    return data.success;
  } catch (error) {
    clearTimeout(timeoutId);

    // If the request times out or fails, log but allow access
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Turnstile verification timed out, allowing access');
    } else {
      console.error('Turnstile verification error:', error);
    }

    return true; // Fallback to allowing access on error
  }
};

/**
 * Middleware that verifies Cloudflare Turnstile tokens before processing requests.
 *
 * Features:
 * - In-memory caching of verified tokens (5 minute TTL)
 * - Configurable timeout with fallback to allow access
 * - Redirects to index on validation failure
 *
 * The token should be sent in one of:
 * - Header: `cf-turnstile-response`
 * - Body: `cfTurnstileResponse`
 * - Query: `cfTurnstileResponse`
 */
export const TurnstileMiddleware = new Middleware<EndpointOptions<Context>, FlatObject, string>({
  handler: async ({ request, options: { context }, response }) => {
    const ctx = context;
    const { enabled, secretKey, timeout } = ctx.runtime.turnstile || {};

    // Skip verification if Turnstile is not configured
    if (!enabled || !secretKey) {
      return {};
    }

    // Extract token from header, body, or query
    const token =
      (request.headers['cf-turnstile-response'] as string) ||
      (request.body as Record<string, unknown>)?.cfTurnstileResponse ||
      (request.query as Record<string, unknown>)?.cfTurnstileResponse;

    if (!token || typeof token !== 'string') {
      ctx.logger.warn('Missing Turnstile token');
      throw createHttpError(
        401,
        'Unauthorized access by site protection, please try again or contact support.',
      );
    }

    // Check cache first
    const cachedTimestamp = verifiedTokens.get(token);
    const now = Date.now();

    if (cachedTimestamp && now - cachedTimestamp < CACHE_TTL_MS) {
      ctx.logger.debug('Turnstile token verified from cache');
      return {};
    }

    // Verify with Cloudflare
    const isValid = await verifyTurnstileToken(token, secretKey, timeout || 3000);

    if (!isValid) {
      ctx.logger.warn({ token: token.substring(0, 10) + '...' }, 'Turnstile verification failed');
      throw createHttpError(
        401,
        'Access denied by site protection, please try again or contact support.',
      );
    }

    // Cache the verified token
    verifiedTokens.set(token, now);
    ctx.logger.debug('Turnstile token verified and cached');

    return {};
  },
});
