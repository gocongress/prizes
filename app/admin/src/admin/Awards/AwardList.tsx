import {
  ColumnsButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  NumberField,
  ReferenceField,
  TopToolbar,
} from 'react-admin';

const AwardListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    {/* <CreateButton /> */}
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const AwardList = () => (
  <List actions={<AwardListActions />}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']} bulkActionButtons={false}>
      <DataTable.Col source="id" />
      <DataTable.Col source="playerName" label="Player">
        <ReferenceField source="playerId" reference="players" />
      </DataTable.Col>
      <DataTable.Col source="prizeTitle" label="Prize">
        <ReferenceField source="prizeId" reference="prizes" />
      </DataTable.Col>
      <DataTable.Col source="eventTitle" label="Event">
        <ReferenceField
          source="prizeId"
          reference="prizes"
          render={(c) => c.referenceRecord?.eventTitle}
        />
      </DataTable.Col>
      <DataTable.Col source="value">
        <NumberField
          source="value"
          options={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2 }}
        />
      </DataTable.Col>
      <DataTable.Col source="redeemCode" label="Redeem Code" />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default AwardList;
