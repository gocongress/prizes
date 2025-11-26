import { AllocationStateViews } from '@/admin/Results/AllocationStateViews';
import { AwardAllocationTable } from '@/admin/Results/AwardAllocationTable';
import { useAllocationWorkflow } from '@/admin/Results/useAllocationWorkflow';
import { useRecordContext } from 'react-admin';

export interface Award {
  playerId: string;
  playerName: string;
  playerAgaId: string;
  place: number;
  division: string;
  prizeTitle: string;
  awardId: string;
  awardValue?: number;
  awardRedeemCode?: string;
  userEmail?: string | null;
  awardAt: string;
  eventTitle: string;
  awardPreferenceOrder?: number | null;
  allocationKind: "DEFAULT" | "PREFERENCE" | "OVERRIDE";
  manualOverride?: boolean; // Track if admin manually changed the award
}

const AllocationWorkflow = () => {
  const record = useRecordContext();
  const hasWinners = record?.winners && record.winners.length > 0;
  const hasAwards = record?.awards && record.awards.length > 0;
  const isLocked = !!record?.allocationLockedAt;
  const isFinalized = !!record?.allocationFinalizedAt;

  const {
    recommendations,
    availableAwards,
    isLoadingRecommendations,
    isAllocating,
    isDeallocating,
    confirmDeallocateOpen,
    confirmFinalizeOpen,
    setConfirmDeallocateOpen,
    setConfirmFinalizeOpen,
    handleAwardChange,
    handleGetRecommendations,
    handleFinalizeAllocations,
    handleDeallocateAwards,
    handleCancelRecommendations,
  } = useAllocationWorkflow(record?.id?.toString());

  // Determine the current state
  const getState = (): 'initial' | 'locked' | 'recommendations' | 'finalized' => {
    if (isFinalized && hasAwards) return 'finalized';
    if (recommendations && recommendations.length > 0) return 'recommendations';
    if (isLocked && !isFinalized && !hasAwards) return 'locked';
    if (hasWinners && !hasAwards && !isLocked) return 'initial';
    return 'initial';
  };

  const state = getState();

  // Don't render anything if no winners
  if (!hasWinners && state === 'initial') {
    return null;
  }

  return (
    <AllocationStateViews
      state={state}
      awardsCount={record?.awards?.length}
      isLoadingRecommendations={isLoadingRecommendations}
      isAllocating={isAllocating}
      isDeallocating={isDeallocating}
      confirmDeallocateOpen={confirmDeallocateOpen}
      confirmFinalizeOpen={confirmFinalizeOpen}
      onGetRecommendations={handleGetRecommendations}
      onFinalizeAllocations={handleFinalizeAllocations}
      onDeallocateAwards={handleDeallocateAwards}
      onCancelRecommendations={handleCancelRecommendations}
      setConfirmDeallocateOpen={setConfirmDeallocateOpen}
      setConfirmFinalizeOpen={setConfirmFinalizeOpen}
    >
      {recommendations && recommendations.length > 0 && (
        <AwardAllocationTable
          recommendations={recommendations}
          availableAwards={availableAwards}
          onAwardChange={handleAwardChange}
        />
      )}
    </AllocationStateViews>
  );
};

export default AllocationWorkflow;

