import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  TopToolbar,
} from 'react-admin';

const EventListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const EventList = () => (
  <List actions={<EventListActions />}>
    <DataTable hiddenColumns={['id', 'registrationUrl', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col label="Event Id" source="slug" />
      <DataTable.Col source="title" />
      <DataTable.Col source="registrationUrl" />
      <DataTable.Col source="description" />
      <DataTable.Col source="startAt" field={DateField} />
      <DataTable.Col source="endAt" field={DateField} />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default EventList;
