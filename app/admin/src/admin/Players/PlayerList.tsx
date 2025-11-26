import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  TopToolbar,
} from 'react-admin';

const PlayerListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const PlayerList = () => (
  <List actions={<PlayerListActions />}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col source="name" />
      <DataTable.Col source="agaId" label="AGA ID" />
      <DataTable.Col source="rank" label="Rank" />
      <DataTable.Col source="email" />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default PlayerList;
