import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const playersRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/admin/players
      get: handlers.Admin.Player.getAllPlayer(context),
      // POST: /api/v1/admin/players
      post: handlers.Admin.Player.createPlayer(context),
    },
    {
      // GET/PUT/PATCH/DELETE: /api/v1/admin/players/{id}
      ':id': route({
        get: handlers.Admin.Player.getPlayerById(context),
        put: handlers.Admin.Player.updatePlayerById(context),
        patch: handlers.Admin.Player.updatePlayerById(context),
        delete: handlers.Admin.Player.deletePlayerById(context),
      }),
      // POST: /api/v1/admin/players/sync
      sync: route({
        post: handlers.Admin.Player.syncPlayer(context),
      }),
    },
  );
