import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const usersRoutes = (context: Context) =>
  nested(
    {
      // POST: /api/v1/users
      post: handlers.User.createUser(context),
    },
    {
      awards: nested(
        {},
        {
          player: nested(
            {},
            {
              ':id': route({
                // GET: /api/v1/users/awards/player/{id}
                get: handlers.User.getUserAwards(context),
              }),
            },
          ),
        },
      ),
    },
  );
