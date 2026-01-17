import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const awardPreferencesRoutes = (context: Context) =>
  nested(
    {},
    {
      player: nested(
        {
          // POST: /api/v1/awardPreferences/player/{id}
          post: handlers.AwardPreference.createAwardPreferences(context),
        },
        {
          ':id': nested(
            {
              // GET: /api/v1/awardPreferences/player/{id}
              get: handlers.AwardPreference.getAwardPreferencesByPlayer(context),
            },
            {
              event: nested(
                {},
                {
                  ':eventId': route({
                    // DELETE: /api/v1/awardPreferences/player/{id}/event/{eventId}
                    delete:
                      handlers.AwardPreference.deleteAwardPreferencesByPlayerAndEvent(context),
                  }),
                },
              ),
            },
          ),
        },
      ),
    },
  );
