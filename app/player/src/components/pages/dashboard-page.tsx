import EventSelect from '@/components/ui/event-select';
import PlayerSelect from '@/components/ui/player-select';
import PrizeList from '@/components/ui/prize-list';
import {
  useAwardPreferences,
  useDeleteAwardPreferences,
  useSaveAwardPreferences,
} from '@/hooks/use-award-preferences';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { useEvent } from '@/hooks/use-event';
import { usePlayer } from '@/hooks/use-player';
import { usePrizes, type PrizeAwardCombination } from '@/hooks/use-prizes';
import { Calendar, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function DashboardPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { prizes, isLoading: isLoadingPrizes } = usePrizes();
  const { selectedPlayer, isLoading: isLoadingPlayers } = usePlayer();
  const { selectedEvent, setSelectedEvent, availableEvents } = useEvent();
  const { awardPreferences, isLoading: isLoadingAwardPreferences } = useAwardPreferences(
    selectedPlayer?.id,
  );
  const { saveAwardPreferences } = useSaveAwardPreferences();
  const { deleteAwardPreferences, isPending: isResettingPreferences } = useDeleteAwardPreferences();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', href: '/dashboard' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter award preferences to only those for the selected event
  const eventAwardPreferences = useMemo(() => {
    if (!selectedEvent) return [];
    // Filter preferences to only those matching prizes in the selected event
    const eventPrizeIds = new Set(
      prizes.filter((prize) => prize.eventId === selectedEvent.id).map((prize) => prize.id),
    );
    return awardPreferences.filter((pref) => eventPrizeIds.has(pref.prizeId));
  }, [awardPreferences, prizes, selectedEvent]);

  // Create a preference map for easy lookup
  const preferenceMap = useMemo(() => {
    if (eventAwardPreferences.length > 0) {
      return new Map(
        eventAwardPreferences.map((pref) => [
          `${pref.prizeId}-${pref.awardValue}`,
          pref.preferenceOrder,
        ]),
      );
    }
    return null;
  }, [eventAwardPreferences]);

  // Create unique combinations of prizeId and award values
  const initialCombinations = useMemo(() => {
    const combinations: PrizeAwardCombination[] = [];

    // Only show prizes if both player and event are selected
    if (!selectedPlayer || !selectedEvent) {
      return combinations;
    }

    // Filter prizes to only those matching the selected event
    const eventPrizes = prizes.filter((prize) => prize.eventId === selectedEvent.id);

    eventPrizes.forEach((prize) => {
      if (prize.awards && prize.awards.length > 0) {
        // Get unique award values for this prize, but only for available awards
        const uniqueValues = new Set(
          prize.awards.filter((award) => award.available).map((award) => award.value),
        );

        uniqueValues.forEach((value) => {
          // Find the first available award with this value to get the awardId
          const award = prize.awards!.find((a) => a.value === value && a.available);
          if (award) {
            combinations.push({
              id: `${prize.id}-${value}`,
              prizeId: prize.id,
              awardValue: value,
              awardId: award.id,
              prize,
            });
          }
        });
      }
    });

    // Sort by award preferences if available
    if (preferenceMap) {
      // Sort combinations based on preference order
      combinations.sort((a, b) => {
        const orderA = preferenceMap.get(a.id) || undefined;
        const orderB = preferenceMap.get(b.id) || undefined;

        // If both have preferences, sort by preference order
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }

        // If only one has a preference, put it first
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;

        // If neither has a preference, maintain original order
        return 0;
      });
    }

    return combinations;
  }, [prizes, preferenceMap, selectedPlayer, selectedEvent]);

  const [prizeAwardCombinations, setPrizeAwardCombinations] = useState<PrizeAwardCombination[]>([]);

  // Update combinations when prizes change
  useEffect(() => {
    setPrizeAwardCombinations(initialCombinations);
  }, [initialCombinations]);

  // Function to save the current order of preferences with debouncing
  const savePreferencesOrder = (orderedCombinations: PrizeAwardCombination[]) => {
    if (!selectedPlayer || !selectedEvent) return;

    // Filter out combinations without awardId (prizes with no awards)
    const validCombinations = orderedCombinations
      .filter((c) => c.awardId)
      .filter((c) => c.prize.eventId === selectedEvent.id);

    if (validCombinations.length === 0) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save to avoid rapid API calls
    saveTimeoutRef.current = setTimeout(() => {
      saveAwardPreferences({
        eventId: selectedEvent.id,
        items: validCombinations.map((combination, index) => ({
          playerId: selectedPlayer.id,
          awardId: combination.awardId!,
          preferenceOrder: index + 1,
        })),
      });
    }, 300);
  };

  const handleReorder = (newCombinations: PrizeAwardCombination[]) => {
    setPrizeAwardCombinations(newCombinations);
    savePreferencesOrder(newCombinations);
  };

  const handleResetToRecommended = () => {
    if (!selectedPlayer || !selectedEvent) return;

    deleteAwardPreferences({
      playerId: selectedPlayer.id,
      eventId: selectedEvent.id,
    });
  };

  if (isLoadingPrizes || isLoadingPlayers || isLoadingAwardPreferences) {
    return (
      <div className="flex pt-12 justify-center min-h-[calc(100vh-4rem)] min-w-full">
        <div className="flex flex-col space-y-3 min-w-full max-w-md w-full px-4">
          <Skeleton className="h-4 w-[75px]" />
          <Skeleton className="h-24 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 pb-2" />
            <Skeleton className="h-8 pb-2" />
            <Skeleton className="h-8 pb-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-[700px]">
        {/* Player Selector */}
        {!isLoadingPlayers && (
          <div className="md:hidden">
            <PlayerSelect variant="standalone" />
          </div>
        )}

        {/* Event Selector - Only show if player has events */}
        {selectedPlayer && availableEvents.length > 0 && (
          <div className="md:hidden">
            <EventSelect
              variant="standalone"
              events={availableEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          </div>
        )}

        {/* No Events Available Message */}
        {selectedPlayer && availableEvents.length === 0 && (
          <div className="text-center text-muted-foreground space-y-4">
            <Calendar className="h-16 w-16 mx-auto opacity-50" />
            <div>
              <h3 className="font-semibold text-lg">No events found</h3>
              <p className="text-sm">
                {selectedPlayer.name} isn't a registered player in any events.
              </p>
            </div>
          </div>
        )}

        {selectedPlayer && selectedEvent && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Available Prizes</h1>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Drag rows or use arrows to rank your preference for the available prizes</li>
              <li>• Your preferences are saved automatically</li>
            </ul>
          </div>
        )}

        {/* No Player Selected Message */}
        {!isLoadingPlayers && !selectedPlayer && (
          <div className="text-center py-12">
            <UserCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Player Selected</h3>
            <p className="text-muted-foreground">
              Please select a player above to view available prizes
            </p>
          </div>
        )}

        {/* No Event Selected Message */}
        {selectedPlayer && !selectedEvent && availableEvents.length > 0 && (
          <div className="text-center py-12">
            <UserCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Event Selected</h3>
            <p className="text-muted-foreground">
              Please select an event above to view available prizes
            </p>
          </div>
        )}

        {/* Prize List - Only show if player and event are selected */}
        {selectedPlayer && selectedEvent && (
          <PrizeList
            prizeAwardCombinations={prizeAwardCombinations}
            onReorder={handleReorder}
            hasAwardPreferences={eventAwardPreferences.length > 0}
            onResetToRecommended={handleResetToRecommended}
            isResetting={isResettingPreferences}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
