import * as handlers from '@/handlers/api';
import { crud } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const registrantsRoutes = (context: Context) =>
  crud({
    // GET: /api/v1/admin/registrants
    getAll: handlers.Admin.Registrant.getAllRegistrant(context),
    // POST: /api/v1/admin/registrants
    create: handlers.Admin.Registrant.createRegistrant(context),
    // GET: /api/v1/admin/registrants/{id}
    getById: handlers.Admin.Registrant.getRegistrantById(context),
    // PUT/PATCH: /api/v1/admin/registrants/{id}
    update: handlers.Admin.Registrant.updateRegistrantById(context),
    // DELETE: /api/v1/admin/registrants/{id}
    delete: handlers.Admin.Registrant.deleteRegistrantById(context),
  });
