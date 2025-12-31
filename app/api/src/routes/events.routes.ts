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
      ':id': route({
        // GET: /api/v1/events/{id}
        get: handlers.Event.getEventById(context),
      }),
    },
  );
