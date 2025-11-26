import ImportButton from '@/components/ImportButton';
import { API_URL } from '@/config';
import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  TopToolbar
} from 'react-admin';

const UserListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
    <ImportButton
      csvFields='email, agaId, name, rank'
      csvNotes={{
        email: "User email address (ex. bob@ross.com)",
        agaId: "AGA ID (ex. 12298)",
        name: "Players full name (ex. Bob Ross)",
        rank: "Registered rank number (ex. -2.1)"
      }}
      dialogTitle='Import Users CSV'
      importUrl={`${API_URL}/api/v1/admin/users/import`} />
  </TopToolbar>
);

const UserList = () => (
  <List actions={<UserListActions />}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col source="email" />
      <DataTable.Col source="oneTimePass" label="Access Code(s)" disableSort />
      <DataTable.Col source="scope" label="API Access Level" />
      <DataTable.Col source="lastLoginAt" field={DateField} />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default UserList;
