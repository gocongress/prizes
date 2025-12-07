import AllocationWorkflow from '@/admin/Results/AllocationWorkflow';
import AwardsField from '@/admin/Results/AwardsField';
import WinnersField from '@/admin/Results/WinnersField';
import {
  DateField,
  EditButton,
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

  return <TopToolbar>{!hasAwards && !isFinalized && <EditButton />}</TopToolbar>;
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
