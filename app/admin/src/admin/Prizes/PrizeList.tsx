import {
  ColumnsButton,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  NumberField,
  SearchInput,
  TopToolbar,
} from 'react-admin';
import ImageThumbnail from './ImageThumbnail';

const filters = [<SearchInput source="q" alwaysOn />];

const PrizeListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
  </TopToolbar>
);

const PrizeList = () => (
  <List actions={<PrizeListActions />} filters={filters}>
    <DataTable
      hiddenColumns={[
        'id',
        'createdAt',
        'updatedAt',
        'awardsSum',
        'description',
        'contact',
        'sponsor',
      ]}
    >
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="eventTitle" label="Event" />
      <DataTable.Col source="description" disableSort />
      <DataTable.Col source="contact" />
      <DataTable.Col source="sponsor" />
      <DataTable.Col source="recommendedRank" label="Recommended Rank" />
      <DataTable.Col source="awardsCount" label="Awards #" disableSort />
      <DataTable.Col label="Awards Total Value" disableSort>
        <NumberField
          source="awardsSum"
          options={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2 }}
        />
      </DataTable.Col>
      <DataTable.Col label="Image Thumbnail">
        <ImageThumbnail />
      </DataTable.Col>
    </DataTable>
  </List>
);

export default PrizeList;
