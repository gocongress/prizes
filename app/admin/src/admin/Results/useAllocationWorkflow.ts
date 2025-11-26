import { type Award } from '@/admin/Results/AllocationWorkflow';
import { type AvailableAward } from '@/admin/Results/AwardAutocomplete';
import { useEffect, useState } from 'react';
import { useDataProvider, useNotify, useRefresh } from 'react-admin';

interface AllocationRecommendations {
  recommendations: Award[];
  locked: boolean;
  finalized: boolean;
}

export const useAllocationWorkflow = (recordId: string | undefined) => {
  const [recommendations, setRecommendations] = useState<Award[] | null>(null);
  const [availableAwards, setAvailableAwards] = useState<AvailableAward[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isDeallocating, setIsDeallocating] = useState(false);
  const [confirmDeallocateOpen, setConfirmDeallocateOpen] = useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);

  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  // Fetch all awards when recommendations are loaded
  useEffect(() => {
    const fetchAvailableAwards = async () => {
      try {
        const response = await dataProvider.getList('awards', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'value', order: 'DESC' },
          filter: {},
        });
        setAvailableAwards(response.data as AvailableAward[]);
      } catch (error) {
        console.error('Error fetching awards:', error);
      }
    };

    if (recommendations && recommendations.length > 0) {
      fetchAvailableAwards();
    }
  }, [recommendations, dataProvider]);

  const handleAwardChange = (index: number, newAward: AvailableAward | null) => {
    if (!recommendations) return;

    const updatedRecommendations = [...recommendations];

    if (!newAward) {
      // Clear the award selection for this winner but keep the row
      updatedRecommendations[index] = {
        ...updatedRecommendations[index],
        awardId: '',
        prizeTitle: '',
        awardValue: undefined,
        awardRedeemCode: undefined,
        manualOverride: true,
        allocationKind: 'OVERRIDE',
      };
    } else {
      // Update the award for this winner
      updatedRecommendations[index] = {
        ...updatedRecommendations[index],
        awardId: newAward.id,
        prizeTitle: newAward.prizeTitle || '',
        awardValue: newAward.value,
        awardRedeemCode: newAward.redeemCode,
        manualOverride: true,
        allocationKind: 'OVERRIDE',
      };
    }

    setRecommendations(updatedRecommendations);
  };

  const handleGetRecommendations = async () => {
    if (!recordId) return;

    setIsLoadingRecommendations(true);
    try {
      const response = await dataProvider.getRoute(`results/${recordId}/allocateAwards`);
      const data = response.data as unknown as AllocationRecommendations;
      setRecommendations(data.recommendations);
      notify('Recommendations loaded. Review and finalize when ready.', { type: 'info' });
      refresh();
    } catch (error) {
      notify((error as Error).message, { type: 'error', autoHideDuration: 7000 });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleFinalizeAllocations = async () => {
    if (!recordId || !recommendations) return;

    // Filter out awards without awardIds (cleared awards)
    const validAwards = recommendations.filter((award) => award.awardId);

    if (validAwards.length === 0) {
      notify('No awards to allocate. Please select at least one award.', { type: 'warning' });
      return;
    }

    setIsAllocating(true);
    setConfirmFinalizeOpen(false);
    try {
      await dataProvider.create(`results/${recordId}/allocateAwards`, {
        data: { awards: validAwards },
      });
      notify('Awards allocated and finalized successfully', { type: 'success' });
      setRecommendations(null);
      refresh();
    } catch (error) {
      notify((error as Error).message, { type: 'error', autoHideDuration: 7000 });
    } finally {
      setIsAllocating(false);
    }
  };

  const handleDeallocateAwards = async () => {
    if (!recordId) return;

    setIsDeallocating(true);
    setConfirmDeallocateOpen(false);
    try {
      await dataProvider.getRoute(`results/${recordId}/deallocateAwards`);
      notify('Awards deallocated successfully', { type: 'success' });
      setRecommendations(null);
      refresh();
    } catch (error) {
      notify((error as Error).message, { type: 'error', autoHideDuration: 7000 });
    } finally {
      setIsDeallocating(false);
    }
  };

  const handleCancelRecommendations = async () => {
    if (!recordId) return;

    try {
      setRecommendations(null);
      notify('Cancelled. You can get recommendations again or deallocate to unlock.', {
        type: 'info',
      });
      refresh();
    } catch (error) {
      notify((error as Error).message, { type: 'error', autoHideDuration: 7000 });
    }
  };

  return {
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
  };
};
