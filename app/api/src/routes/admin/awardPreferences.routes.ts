import * as handlers from '@/handlers/api';
import { crud, nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const awardPreferencesRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/admin/awardPreferences
      get: handlers.Admin.AwardPreference.getAllAwardPreference(context),
      // POST: /api/v1/admin/awardPreferences
      post: handlers.Admin.AwardPreference.createAwardPreference(context),
    },
    {
      player: nested({}, {
        ':playerId': route({
          // GET: /api/v1/admin/awardPreferences/player/{playerId}
          get: handlers.Admin.AwardPreference.getAwardPreferencesByPlayer(context),
        }),
      }),
      ':id': route({
        // GET: /api/v1/admin/awardPreferences/{id}
        get: handlers.Admin.AwardPreference.getAwardPreferenceById(context),
        // PUT/PATCH: /api/v1/admin/awardPreferences/{id}
        put: handlers.Admin.AwardPreference.updateAwardPreferenceById(context),
        patch: handlers.Admin.AwardPreference.updateAwardPreferenceById(context),
        // DELETE: /api/v1/admin/awardPreferences/{id}
        delete: handlers.Admin.AwardPreference.deleteAwardPreferenceById(context),
      }),
    },
  );
