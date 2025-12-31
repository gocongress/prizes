import type { Context } from '@/types';
import { awardPreferencesRoutes } from './awardPreferences.routes';
import { awardsRoutes } from './awards.routes';
import { eventsRoutes } from './events.routes';
import { playersRoutes } from './players.routes';
import { prizesRoutes } from './prizes.routes';
import { registrantsRoutes } from './registrants.routes';
import { resultsRoutes } from './results.routes';
import { usersRoutes } from './users.routes';

export const adminRoutes = (context: Context) => ({
  awards: awardsRoutes(context),
  awardPreferences: awardPreferencesRoutes(context),
  events: eventsRoutes(context),
  players: playersRoutes(context),
  prizes: prizesRoutes(context),
  registrants: registrantsRoutes(context),
  results: resultsRoutes(context),
  users: usersRoutes(context),
});
