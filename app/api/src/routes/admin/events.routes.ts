import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const eventsRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/admin/events
      get: handlers.Admin.Event.getAllEvent(context),
      // POST: /api/v1/admin/events
      post: handlers.Admin.Event.createEvent(context),
    },
    {
      ':id': nested(
        {
          // GET: /api/v1/admin/events/{id}
          get: handlers.Admin.Event.getEventById(context),
          // PUT/PATCH: /api/v1/admin/events/{id}
          put: handlers.Admin.Event.updateEventById(context),
          patch: handlers.Admin.Event.updateEventById(context),
          // DELETE: /api/v1/admin/events/{id}
          delete: handlers.Admin.Event.deleteEventById(context),
        },
        {
          // POST: /api/v1/admin/events/{id}/welcome-emails
          'welcome-emails': route({
            post: handlers.Admin.WelcomeEmail.sendEventWelcomeEmailsHandler(context),
          }),
        },
      ),
    },
  );
