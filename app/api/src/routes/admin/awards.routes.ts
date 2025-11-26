import * as handlers from '@/handlers/api';
import { crud } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const awardsRoutes = (context: Context) =>
  crud({
    // GET: /api/v1/admin/awards
    getAll: handlers.Admin.Award.getAllAward(context),
    // POST: /api/v1/admin/awards
    create: handlers.Admin.Award.createAward(context),
    // GET: /api/v1/admin/awards/{id}
    getById: handlers.Admin.Award.getAwardById(context),
    // PUT/PATCH: /api/v1/admin/awards/{id}
    update: handlers.Admin.Award.updateAwardById(context),
    // DELETE: /api/v1/admin/awards/{id}
    delete: handlers.Admin.Award.deleteAwardById(context),
  });
