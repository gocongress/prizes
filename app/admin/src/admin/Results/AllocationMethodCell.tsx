import type { Award } from '@/admin/Results/AllocationWorkflow';
import { Chip } from '@mui/material';

const AllocationMethodCell = ({ award }: { award: Award }) => {
  switch (award.allocationKind) {
    case 'DEFAULT':
      return <Chip label="Default" color="default" size="small" />;
    case 'OVERRIDE':
      return <Chip label="Override" color="warning" size="small" />;
    case 'PREFERENCE':
      return (
        <Chip label={`Preference #${award.awardPreferenceOrder}`} color="success" size="small" />
      );
    default:
      return <Chip label="No Award" color="error" size="small" />;
  }
};

export default AllocationMethodCell;
