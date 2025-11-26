import * as handlers from '@/handlers/api';
import { nested, route } from '@/lib/routing-helpers';
import type { Context } from '@/types';

export const prizesRoutes = (context: Context) =>
  nested(
    {
      // GET: /api/v1/prizes
      get: handlers.Prize.getAllPrize(context),
    },
    {
      ':id': route({
        // GET: /api/v1/prizes/{id}
        get: handlers.Prize.getPrizeById(context),
      }),
    },
  );
