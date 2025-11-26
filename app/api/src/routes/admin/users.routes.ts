import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const usersRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/admin/users
      get: handlers.Admin.User.getAllUser(context),
      // POST: /api/v1/admin/users
      post: handlers.Admin.User.createUser(context),
    },
    {
      // POST: /api/v1/admin/users/import
      import: route({
        post: handlers.Admin.User.importUsers(context),
      }),
      ':id': route({
        // GET: /api/v1/admin/users/{id}
        get: handlers.Admin.User.getUserById(context),
        // PUT/PATCH: /api/v1/admin/users/{id}
        put: handlers.Admin.User.updateUserById(context),
        patch: handlers.Admin.User.updateUserById(context),
        // DELETE: /api/v1/admin/users/{id}
        delete: handlers.Admin.User.deleteUserById(context),
      }),
    },
  );
