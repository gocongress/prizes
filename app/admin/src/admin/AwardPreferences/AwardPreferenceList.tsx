import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  NumberField,
  ReferenceField,
  TopToolbar,
} from 'react-admin';

const AwardPreferenceListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const AwardPreferenceList = () => (
  <List actions={<AwardPreferenceListActions />}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col source="playerId" label="Player">
        <ReferenceField source="playerId" reference="players" />
      </DataTable.Col>
      <DataTable.Col source="awardId" label="Award">
        <ReferenceField source="awardId" reference="awards" />
      </DataTable.Col>
      <DataTable.Col source="preferenceOrder" label="Preference Order" field={NumberField} />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default AwardPreferenceList;
