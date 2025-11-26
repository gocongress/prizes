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
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']}>
      <DataTable.Col source="id" />
      <DataTable.Col source="prizeTitle" label="Prize">
        <ReferenceField source="prizeId" reference="prizes" />
      </DataTable.Col>
      <DataTable.Col source="value">
        <NumberField
          source="value"
          options={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2 }}
        />
      </DataTable.Col>
      <DataTable.Col source="redeemCode" label="Redeem Code" />
      <DataTable.Col source="playerName" label="Awarded to Player">
        <ReferenceField source="playerId" reference="players" />
      </DataTable.Col>
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
    </DataTable>
  </List>
);

export default AwardList;
