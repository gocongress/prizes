import awardPreferences from '@/admin/AwardPreferences';
import awards from '@/admin/Awards';
import events from '@/admin/Events';
import players from '@/admin/Players';
import prizes from '@/admin/Prizes';
import results from '@/admin/Results';
import users from '@/admin/Users';
import { APP_BASENAME } from '@/config';
import LoginPage from '@/Login';
import apiProvider from '@/providers/api';
import { authProvider } from '@/providers/api/authProvider';
import {
  AccountCircle,
  EmojiEvents,
  Event,
  Face,
  Leaderboard,
  Tune,
  WorkspacePremium,
} from '@mui/icons-material';
import { Admin, Resource } from 'react-admin';

const App = () => (
  <Admin
    basename={APP_BASENAME}
    dataProvider={apiProvider}
    authProvider={authProvider}
    loginPage={LoginPage}
    requireAuth
  >
    <Resource
      name="users"
      {...users}
      icon={AccountCircle}
      recordRepresentation={(record) => record.email}
    />
    <Resource
      name="players"
      {...players}
      icon={Face}
      recordRepresentation={(record) => `${record.name} (${record.agaId})`}
      hasCreate={false}
      hasEdit={false}
      hasShow={false}
    />
    <Resource
      name="awardPreferences"
      {...awardPreferences}
      options={{ label: 'Player Award Preferences' }}
      icon={Tune}
    />
    <Resource
      name="events"
      {...events}
      icon={Event}
      recordRepresentation={(record) => record.title}
    />
    <Resource
      name="prizes"
      {...prizes}
      icon={EmojiEvents}
      recordRepresentation={(record) => record.title}
    />
    <Resource
      name="awards"
      {...awards}
      icon={WorkspacePremium}
      recordRepresentation={(record) => `${record.prizeTitle} - $${record.value}`}
    />
    <Resource
      name="results"
      {...results}
      icon={Leaderboard}
      recordRepresentation={(record) => `${record.eventTitle}`}
    />
  </Admin>
);

export default App;
