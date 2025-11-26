import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const authRoutes = (context: Context) =>
  nested({}, {
    // GET: /api/v1/auth/profile
    profile: route({
      get: handlers.Auth.userProfile(context),
    }),
    // POST: /api/v1/auth/login
    login: route({
      post: handlers.Auth.loginUser(context),
    }),
    // POST: /api/v1/auth/logout
    logout: route({
      post: handlers.Auth.logoutUser(context),
    }),
  });
