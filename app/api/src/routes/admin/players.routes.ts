import * as handlers from '@/handlers/api';
import { crud } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const playersRoutes = (context: Context) =>
  crud({
    // GET: /api/v1/admin/players
    getAll: handlers.Admin.Player.getAllPlayer(context),
    // POST: /api/v1/admin/players
    create: handlers.Admin.Player.createPlayer(context),
    // GET: /api/v1/admin/players/{id}
    getById: handlers.Admin.Player.getPlayerById(context),
    // PUT/PATCH: /api/v1/admin/players/{id}
    update: handlers.Admin.Player.updatePlayerById(context),
    // DELETE: /api/v1/admin/players/{id}
    delete: handlers.Admin.Player.deletePlayerById(context),
  });
