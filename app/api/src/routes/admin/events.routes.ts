import * as handlers from '@/handlers/api';
import { crud } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const eventsRoutes = (context: Context) =>
  crud({
    // GET: /api/v1/admin/events
    getAll: handlers.Admin.Event.getAllEvent(context),
    // POST: /api/v1/admin/events
    create: handlers.Admin.Event.createEvent(context),
    // GET: /api/v1/admin/events/{id}
    getById: handlers.Admin.Event.getEventById(context),
    // PUT/PATCH: /api/v1/admin/events/{id}
    update: handlers.Admin.Event.updateEventById(context),
    // DELETE: /api/v1/admin/events/{id}
    delete: handlers.Admin.Event.deleteEventById(context),
  });
