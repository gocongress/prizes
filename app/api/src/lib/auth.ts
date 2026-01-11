import { type ScopeKindKey } from '@/lib/handlers';
import type { Context } from '@/types';
import createHttpError from 'http-errors';
import { JsonWebTokenError, sign, verify, type JwtPayload } from 'jsonwebtoken';
import { ScopeKinds } from './constants';

export const getUserJwt = (
  context: Context,
  user: { id: string; email: string; scope: ScopeKindKey },
) => {
  const userJwt = sign(
    { sub: user.id, scopes: ScopeKinds[user.scope] },
    context.runtime.jwtSecretKey,
    {
      expiresIn: context.runtime.jwtExpiresIn,
    },
  );
  return userJwt;
};

export const verifyUserJwt = (context: Context, token: string): JwtPayload => {
  const jwt = verify(token, context.runtime.jwtSecretKey) as JwtPayload | JsonWebTokenError;
  if (jwt instanceof JsonWebTokenError) throw createHttpError(401, 'Invalid token');
  if (!jwt.sub) throw createHttpError(401, 'Invalid token');
  return jwt;
};
