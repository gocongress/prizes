import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const awardPreferencesRoutes = (context: Context) =>
  nested({}, {
    player: nested(
      {
        // POST: /api/v1/awardPreferences/player/{id}
        post: handlers.AwardPreference.createAwardPreferences(context),
      },
      {
        ':id': route({
          // GET: /api/v1/awardPreferences/player/{id}
          get: handlers.AwardPreference.getAwardPreferencesByPlayer(context),
          // DELETE: /api/v1/awardPreferences/player/{id}
          delete: handlers.AwardPreference.deleteAwardPreferencesByPlayer(context),
        }),
      },
    ),
  });
