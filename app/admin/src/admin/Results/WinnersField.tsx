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

interface WinnersFieldProps {
  source: string;
}

const WinnersField = ({ source }: WinnersFieldProps) => {
  const record = useRecordContext();
  const winners = record?.[source] || [];

  if (!winners || winners.length === 0) {
    return <Typography color="text.secondary">No winners recorded</Typography>;
  }

  // Sort winners by division and then by place
  const sortedWinners = [...winners].sort(
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
            <TableCell>Division</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Player AGA ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedWinners.map(
            (winner: { division: string; place: number; agaId: string }, idx: number) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      {winner.division}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`#${winner.place}`}
                    color={
                      winner.place === 1 ? 'primary' : winner.place === 2 ? 'secondary' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">{winner.agaId}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WinnersField;
