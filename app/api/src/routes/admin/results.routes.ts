import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const resultsRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/admin/results
      get: handlers.Admin.Result.getAllResult(context),
      // POST: /api/v1/admin/results
      post: handlers.Admin.Result.createResult(context),
    },
    {
      // POST: /api/v1/admin/results/import
      import: route({
        post: handlers.Admin.Result.importResults(context),
      }),
      event: nested(
        {},
        {
          ':eventId': route({
            // GET: /api/v1/admin/results/event/{eventId}
            get: handlers.Admin.Result.getResultByEventId(context),
          }),
        },
      ),
      ':id': nested(
        {
          // GET: /api/v1/admin/results/{id}
          get: handlers.Admin.Result.getResultById(context),
          // PUT/PATCH: /api/v1/admin/results/{id}
          put: handlers.Admin.Result.updateResultById(context),
          patch: handlers.Admin.Result.updateResultById(context),
          // DELETE: /api/v1/admin/results/{id}
          delete: handlers.Admin.Result.deleteResultById(context),
        },
        {
          allocateAwards: route({
            // GET: /api/v1/admin/results/{id}/allocateAwards - Get allocation recommendations
            get: handlers.Admin.Result.getAllocationRecommendations(context),
            // POST: /api/v1/admin/results/{id}/allocateAwards - Finalize allocations
            post: handlers.Admin.Result.allocateAwardsToWinners(context),
          }),
          deallocateAwards: route({
            // GET: /api/v1/admin/results/{id}/deallocateAwards
            get: handlers.Admin.Result.getDeallocationRecommendations(context),
          }),
        },
      ),
    },
  );
