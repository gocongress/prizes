import AllocationWorkflow from '@/admin/Results/AllocationWorkflow';
import AwardsField from '@/admin/Results/AwardsField';
import WinnersField from '@/admin/Results/WinnersField';
import ImportButton from '@/components/ImportButton';
import { API_URL } from '@/config';
import {
  DateField,
  Labeled,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
} from 'react-admin';

const ResultShowActions = () => {
  const record = useRecordContext();
  const hasAwards = record?.awards && record.awards.length > 0;
  const isFinalized = !!record?.allocationFinalizedAt;

  return (
    <TopToolbar>
      {!hasAwards && !isFinalized && (
        <ImportButton
          buttonLabel="Re-import CSV"
          dialogTitle="Re-import Results CSV"
          referenceSelector={{
            reference: 'events',
            label: 'Event',
            fieldName: 'eventId',
            optionText: 'title',
            defaultValue: record?.eventId,
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
      )}
    </TopToolbar>
  );
};

const ResultShow = () => {
  return (
    <Show actions={<ResultShowActions />}>
      <SimpleShowLayout>
        <Labeled label="Id">
          <TextField source="id" />
        </Labeled>
        <Labeled label="Event">
          <ReferenceField source="eventId" reference="events" link="show" />
        </Labeled>
        <Labeled label="Created At">
          <DateField source="createdAt" showTime />
        </Labeled>
        <Labeled label="Updated At">
          <DateField source="updatedAt" showTime />
        </Labeled>

        {/* Winners Section */}
        <Labeled label="Winners">
          <WinnersField source="winners" />
        </Labeled>

        {/* Allocation Workflow - handles both recommendations and finalized states */}
        <Labeled label="Award Allocation">
          <AllocationWorkflow />
        </Labeled>

        {/* Awards Section - only show if finalized */}
        <Labeled label="Allocated Awards">
          <AwardsField source="awards" />
        </Labeled>
      </SimpleShowLayout>
    </Show>
  );
};

export default ResultShow;
