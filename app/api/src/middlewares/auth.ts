import { verifyUserJwt } from '@/lib/auth';
import type { GetJwtUser, ScopeKind } from '@/lib/handlers';
import type { EndpointOptions } from '@/lib/handlers/helpers';
import type { Context } from '@/types';
import { Middleware, type FlatObject } from 'express-zod-api';
import createHttpError from 'http-errors';

export const AuthMiddleware = (getUser: GetJwtUser<Context>, scopes: ScopeKind) =>
  new Middleware<EndpointOptions<Context>, FlatObject, string>({
    security: { or: [{ type: 'bearer' }, { type: 'cookie', name: 'auth' }] },
    handler: async ({ request, options: { context } }) => {
      const { server, logger } = context;
      const cookie = request.cookies ? request.cookies[server.cookieName] : undefined;
      const token = cookie ?? request.headers.authorization?.split(' ')[1];
      logger.debug(
        { cookiePresent: !!cookie, authHeaderPresent: !!request.headers.authorization, token },
        'User JWT authentication attempt',
      );

      if (!token) throw createHttpError(401, 'Missing token');

      const jwt = verifyUserJwt(context, token);
      const { user } = await getUser(context, jwt);

      // Admin users can access everything
      const isAdmin = jwt.scopes?.includes('admin') && user.scope === 'ADMIN';

      // JWT has been validated, non-admin users must have all scopes matching the endpoints configured
      // scopes to get access to the resource.
      const hasScope = isAdmin || scopes.every((scope) => jwt.scopes?.includes(scope));

      // Finally, if the JWT sub (user id) is mismatched to the user or scopes mismatching disallow the request
      if (user.id !== jwt.sub || !hasScope) throw createHttpError(403, 'Forbidden');

      logger.info(
        { userId: jwt.sub, scopes: { apiAllows: scopes, userHas: jwt.scopes } },
        'User authenticated',
      );
      if (!context.request) {
        context.request = { token, scopes, jwtPayload: jwt };
      } else {
        context.request.jwtPayload = jwt;
        context.request.scopes = scopes;
        context.request.token = token;
      }
      return { user }; // provides endpoints with options.user
    },
  });
