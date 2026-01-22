import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const eventsRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/events
      get: handlers.Event.getAllEvents(context),
    },
    {
      slug: nested(
        {},
        {
          ':slug': route({
            // GET: /api/v1/events/slug/{slug}
            get: handlers.Event.getEventBySlug(context),
          }),
        },
      ),
      ':id': nested(
        {
          // GET: /api/v1/events/{id}
          get: handlers.Event.getEventById(context),
        },
        {
          register: nested(
            {},
            {
              ':playerId': route({
                // POST: /api/v1/events/{id}/register/{playerId}
                post: handlers.Event.selfRegisterForEvent(context),
                // DELETE: /api/v1/events/{id}/register/{playerId}
                delete: handlers.Event.selfUnregisterFromEvent(context),
              }),
            },
          ),
        },
      ),
    },
  );
