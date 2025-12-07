import AllocationMethodCell from '@/admin/Results/AllocationMethodCell';
import type { Award } from '@/admin/Results/AllocationWorkflow';
import EmailIcon from '@mui/icons-material/Email';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
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
import { useRecordContext } from 'react-admin';

interface AwardsFieldProps {
  source: string;
}

const AwardsField = ({ source }: AwardsFieldProps) => {
  const record = useRecordContext();
  const awards = record?.[source] || [];

  if (!awards || awards.length === 0) {
    return <Typography color="text.secondary">No awards allocated</Typography>;
  }

  // Sort awards by division and then by place
  const sortedAwards = [...awards].sort(
    (a: { division: string; place: number }, b: { division: string; place: number }) => {
      const divCompare = a.division.localeCompare(b.division);
      if (divCompare !== 0) return divCompare;
      return a.place - b.place;
    },
  );

  return (
    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Division</TableCell>
            <TableCell>Prize</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Redeem Code</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Awarded At</TableCell>
            <TableCell>Allocation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAwards.map((award: Award, idx: number) => (
            <TableRow key={idx} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {award.playerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AGA ID: {award.playerAgaId}
                    </Typography>
                  </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    {award.division}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{award.prizeTitle}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">
                    {award.awardValue ? `$${award.awardValue.toFixed(2)}` : 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  {award.awardRedeemCode}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{award.userEmail || 'N/A'}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{new Date(award.awardAt).toLocaleString()}</Typography>
              </TableCell>
              <TableCell>
                <AllocationMethodCell award={award} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AwardsField;
