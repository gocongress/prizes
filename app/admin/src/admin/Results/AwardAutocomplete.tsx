import type { Award } from '@/admin/Results/AllocationWorkflow';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

export interface AvailableAward {
  id: string;
  prizeTitle?: string;
  value?: number;
  redeemCode?: string;
  available: boolean;
  isSelected?: boolean;
  isUnavailable?: boolean;
}

interface AwardAutocompleteProps {
  award: Award;
  availableAwards: AvailableAward[];
  selectedAwardIds: string[];
  onChange: (newValue: AvailableAward | null) => void;
}

export const AwardAutocomplete = ({
  award,
  availableAwards,
  selectedAwardIds,
  onChange,
}: AwardAutocompleteProps) => {
  const currentAward = award.awardId ? availableAwards.find((a) => a.id === award.awardId) : null;

  // Filter out awards that are already selected by other winners
  const allOptions = availableAwards
    .filter((a) => !selectedAwardIds.includes(a.id) && a.available)
    .map((a) => ({
      ...a,
      isSelected: false,
      isUnavailable: !a.available,
    }));

  // Include the currently selected award even if it's selected or not in the available list
  if (award.awardId && !allOptions.find((a) => a.id === award.awardId)) {
    const currentAwardFromList = availableAwards.find((a) => a.id === award.awardId);
    allOptions.push({
      id: award.awardId,
      prizeTitle: award.prizeTitle || currentAwardFromList?.prizeTitle,
      value: award.awardValue ?? currentAwardFromList?.value,
      available: currentAwardFromList?.available ?? false,
      isSelected: selectedAwardIds.includes(award.awardId),
      isUnavailable: currentAwardFromList ? !currentAwardFromList.available : false,
    });
  }

  // Determine the state of the currently selected award in the Autocomplete select list
  const getSelectedAward = (): AvailableAward | null => {
    if (award.awardId && currentAward) {
      return {
        ...currentAward,
        isSelected: selectedAwardIds.includes(currentAward.id),
        isUnavailable: !currentAward.available,
      };
    } else if (award.awardId) {
      return {
        id: award.awardId,
        prizeTitle: award.prizeTitle,
        value: award.awardValue,
        available: false,
        isSelected: false,
        isUnavailable: false,
      };
    }
    return null;
  };

  return (
    <Autocomplete
      size="small"
      value={getSelectedAward()}
      onChange={(_event, newValue) => onChange(newValue)}
      options={allOptions}
      getOptionLabel={(option) => option?.prizeTitle || 'Unknown Prize'}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" placeholder="Select award" />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{option.prizeTitle}</Typography>
              {option.isUnavailable && (
                <Chip label="Unavailable" size="small" color="error" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              ${option.value?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
        </li>
      )}
    />
  );
};
