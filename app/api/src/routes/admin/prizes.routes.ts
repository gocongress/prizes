import * as handlers from '@/handlers/api';
import { crud } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const prizesRoutes = (context: Context) =>
  crud({
    // GET: /api/v1/admin/prizes
    getAll: handlers.Admin.Prize.getAllPrize(context),
    // POST: /api/v1/admin/prizes
    create: handlers.Admin.Prize.createPrize(context),
    // GET: /api/v1/admin/prizes/{id}
    getById: handlers.Admin.Prize.getPrizeById(context),
    // PUT/PATCH: /api/v1/admin/prizes/{id}
    update: handlers.Admin.Prize.updatePrizeById(context),
    // DELETE: /api/v1/admin/prizes/{id}
    delete: handlers.Admin.Prize.deletePrizeById(context),
  });
