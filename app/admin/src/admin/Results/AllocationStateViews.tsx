import { DeleteForever, Lock, LockOpen } from '@mui/icons-material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { CurrencyExchange, Save } from '@mui/icons-material';
import { Alert, Box, Button, Typography } from '@mui/material';
import { Confirm } from 'react-admin';

interface AllocationStateViewsProps {
  state: 'initial' | 'locked' | 'recommendations' | 'finalized';
  awardsCount?: number;
  isLoadingRecommendations: boolean;
  isAllocating: boolean;
  isDeallocating: boolean;
  confirmDeallocateOpen: boolean;
  confirmFinalizeOpen: boolean;
  onGetRecommendations: () => void;
  onFinalizeAllocations: () => void;
  onDeallocateAwards: () => void;
  onCancelRecommendations: () => void;
  setConfirmDeallocateOpen: (open: boolean) => void;
  setConfirmFinalizeOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

// Component for displaying deallocate warnings with emphasis
const DeallocateWarningContent = () => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          color: 'error.main',
          fontWeight: 'bold',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <DeleteForever color="error" />
        WARNING: Irreversible Action
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        This will permanently remove <strong>all award allocations</strong> from this result.
      </Typography>

      <Box
        sx={{
          bgcolor: 'error.main',
          borderRadius: 1,
          p: 2,
          mb: 2,
        }}
      >
        <Box component="ul" sx={{ m: 0, pl: 2, color: 'white' }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Awards will be returned</strong> to the available pool, making them available to
            be awarded to <strong>other players</strong>.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>All awards will be unassigned</strong> from all players in this result.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Player notifications</strong> may be confusing if already sent.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>This action cannot be undone.</strong>
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Are you absolutely sure you want to proceed?
      </Typography>
    </Box>
  );
};

export const AllocationStateViews = ({
  state,
  awardsCount,
  isLoadingRecommendations,
  isAllocating,
  isDeallocating,
  confirmDeallocateOpen,
  confirmFinalizeOpen,
  onGetRecommendations,
  onFinalizeAllocations,
  onDeallocateAwards,
  onCancelRecommendations,
  setConfirmDeallocateOpen,
  setConfirmFinalizeOpen,
  children,
}: AllocationStateViewsProps) => {
  if (state === 'finalized') {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success" sx={{ mb: 2 }} icon={<LockOpen />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Award allocation is finalized. {awardsCount} awards allocated.
            </Typography>
          </Box>
        </Alert>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForever />}
          onClick={() => setConfirmDeallocateOpen(true)}
          disabled={isDeallocating}
        >
          Deallocate All Awards
        </Button>
        <Confirm
          isOpen={confirmDeallocateOpen}
          title="Deallocate Awards"
          content={<DeallocateWarningContent />}
          onConfirm={onDeallocateAwards}
          onClose={() => setConfirmDeallocateOpen(false)}
          confirm="Deallocate All Awards"
          confirmColor="warning"
          cancel="Cancel"
        />
      </Box>
    );
  }

  if (state === 'recommendations') {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }} icon={<Lock />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Prize allocation for all other results is locked until these allocations are finalized
              or cancelled. Review the recommendations below. You can modify them before finalizing.
            </Typography>
          </Box>
        </Alert>

        {children}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={() => setConfirmFinalizeOpen(true)}
            disabled={isAllocating}
          >
            Finalize Allocations
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancelRecommendations}
            disabled={isAllocating}
          >
            Clear Allocations
          </Button>
        </Box>
        <Confirm
          isOpen={confirmFinalizeOpen}
          title="Finalize Award Allocations"
          content="Are you sure you want to finalize these award allocations? Once finalized, other results will be able to allocate awards. You can still deallocate if needed."
          onConfirm={onFinalizeAllocations}
          onClose={() => setConfirmFinalizeOpen(false)}
          confirm="Yes, Finalize Allocations"
          cancel="Cancel"
        />
      </Box>
    );
  }

  if (state === 'initial') {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Click below to generate award allocation recommendations based on player preferences and
            award values.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          color="success"
          startIcon={<EmojiEventsIcon />}
          onClick={onGetRecommendations}
          disabled={isLoadingRecommendations}
        >
          Get Allocation Recommendations
        </Button>
      </Box>
    );
  }

  if (state === 'locked') {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Lock />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Allocation is in progress. Load recommendations to continue, or cancel to remove the
              lock and allow other results to allocate prizes.
            </Typography>
          </Box>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CurrencyExchange />}
            onClick={onGetRecommendations}
            disabled={isLoadingRecommendations || isDeallocating}
          >
            Load Recommendations
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setConfirmDeallocateOpen(true)}
            disabled={isLoadingRecommendations || isDeallocating}
          >
            Cancel & Unlock
          </Button>
        </Box>
        <Confirm
          isOpen={confirmDeallocateOpen}
          title="Cancel Allocation"
          content="This will cancel the allocation in progress and unlock so other results can allocate awards. Are you sure?"
          onConfirm={onDeallocateAwards}
          onClose={() => setConfirmDeallocateOpen(false)}
          confirm="Yes, Cancel & Unlock"
          cancel="Keep Lock"
        />
      </Box>
    );
  }

  return null;
};
