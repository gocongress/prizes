import AllocationMethodCell from '@/admin/Results/AllocationMethodCell';
import type { Award } from '@/admin/Results/AllocationWorkflow';
import { type AvailableAward, AwardAutocomplete } from '@/admin/Results/AwardAutocomplete';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface AwardAllocationTableProps {
  recommendations: Award[];
  availableAwards: AvailableAward[];
  onAwardChange: (index: number, newAward: AvailableAward | null) => void;
}

export const AwardAllocationTable = ({
  recommendations,
  availableAwards,
  onAwardChange,
}: AwardAllocationTableProps) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Division</TableCell>
            <TableCell>Prize</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Allocation Method</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recommendations.map((award, idx) => {
            // Get all awards that are already selected by other winners (not this one)
            const selectedAwardIds = recommendations
              .filter((_, i) => i !== idx)
              .filter((a) => a.awardId)
              .map((a) => a.awardId);

            return (
              <TableRow key={idx} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {award.playerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AGA ID: {award.playerAgaId}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`#${award.place}`}
                    color={
                      award.place === 1 ? 'primary' : award.place === 2 ? 'secondary' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {award.division}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 250 }}>
                  <AwardAutocomplete
                    award={award}
                    availableAwards={availableAwards}
                    selectedAwardIds={selectedAwardIds}
                    onChange={(newValue) => onAwardChange(idx, newValue)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {award.awardValue ? `$${award.awardValue.toFixed(2)}` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <AllocationMethodCell award={award} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
