import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  ReferenceField,
  SearchInput,
  TopToolbar,
} from 'react-admin';

const filters = [<SearchInput source="q" alwaysOn />];

const RegistrantListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const RegistrantList = () => (
  <List actions={<RegistrantListActions />} filters={filters}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col source="playerName" label="Player">
        <ReferenceField
          source="playerId"
          reference="players"
          render={(c) => c.referenceRecord?.name}
        />
      </DataTable.Col>
      <DataTable.Col source="eventTitle" label="Event">
        <ReferenceField
          source="eventId"
          reference="events"
          render={(c) => c.referenceRecord?.eventTitle}
        />
      </DataTable.Col>
      <DataTable.Col source="registrationDate" field={DateField} />
      <DataTable.Col source="status" />
      <DataTable.Col source="notes" />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default RegistrantList;
