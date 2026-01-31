import ImportButton from '@/components/ImportButton';
import { API_URL } from '@/config';
import { VisibilityOutlined } from '@mui/icons-material';
import { Chip, IconButton, Tooltip } from '@mui/material';
import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  ExportButton,
  List,
  ReferenceField,
  TopToolbar,
  useRecordContext,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';

const ResultListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <CreateButton />
    <ExportButton maxResults={100} />
    {/* Give the user an easy way to import results via CSV, while providing them with a list of events to select for the imported results */}
    <ImportButton
      dialogTitle="Import Results CSV"
      referenceSelector={{
        reference: 'events',
        label: 'Event',
        fieldName: 'eventId',
        optionText: 'title',
      }}
      csvFields="place,agaId,division"
      csvNotes={{
        place: 'Place/rank number (ex. 1, 2, 3)',
        agaId: 'Player AGA ID (ex. 12298)',
        division: 'Division name (ex. Open, Kyu, Dan)',
      }}
      confirmMessage="BEWARE! Importing these results will destroy any previous results related to the selected event. Are you sure you want to import these results?"
      importUrl={`${API_URL}/api/v1/admin/results/import`}
      payloadKey="results"
    />
  </TopToolbar>
);

const LockedColumn = () => {
  const record = useRecordContext();
  if (!record) return null;
  if (record.allocationFinalizedAt) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return record.allocationLockedAt ? (
    <Chip label={formatDate(record.allocationLockedAt)} color="error" size="small" />
  ) : null;
};

const ActionsColumn = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/results/${record.id}/show`);
          }}
        >
          <VisibilityOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const ResultList = () => (
  <List actions={<ResultListActions />}>
    <DataTable hiddenColumns={['id', 'createdAt', 'updatedAt']} rowClick="show">
      <DataTable.Col source="id" />
      <DataTable.Col label="Event Title">
        <ReferenceField source="eventId" reference="events" link={false} />
      </DataTable.Col>
      <DataTable.Col label="Results" render={(record) => record.winners.length} />
      <DataTable.Col label="Awards" render={(record) => record.awards?.length || 0} />
      <DataTable.Col label="Locked">
        <LockedColumn />
      </DataTable.Col>
      <DataTable.Col label="Completed" source="allocationFinalizedAt" field={DateField} />
      <DataTable.Col source="createdAt" field={DateField} />
      <DataTable.Col source="updatedAt" field={DateField} />
      <DataTable.Col label="Actions">
        <ActionsColumn />
      </DataTable.Col>
    </DataTable>
  </List>
);

export default ResultList;
