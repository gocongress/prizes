import SortablePrizeItem from "@/components//ui/sortable-prize-item";
import PlayerSelect from "@/components/ui/player-select";
import { useAwardPreferences, useSaveAwardPreferences } from "@/hooks/use-award-preferences";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { usePlayer } from "@/hooks/use-player";
import { usePrizes, type PrizeAwardCombination } from "@/hooks/use-prizes";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ArrowDownAZ, Star, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export function DashboardPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { prizes, isLoading: isLoadingPrizes } = usePrizes();
  const { selectedPlayer, isLoading: isLoadingPlayers } = usePlayer();
  const { awardPreferences, isLoading: isLoadingAwardPreferences } = useAwardPreferences(selectedPlayer?.id);
  const { saveAwardPreferences } = useSaveAwardPreferences();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { title: 'Dashboard', href: '/dashboard' },
    ]);
  }, []);

  // Create a preference map for easy lookup
  const preferenceMap = useMemo(() => {
    if (awardPreferences.length > 0) {
      return new Map(
        awardPreferences.map(pref => [`${pref.prizeId}-${pref.awardValue}`, pref.preferenceOrder])
      );
    }
    return null;
  }, [awardPreferences]);

  // Create unique combinations of prizeId and award values
  const initialCombinations = useMemo(() => {
    const combinations: PrizeAwardCombination[] = [];

    prizes.forEach((prize) => {
      if (prize.awards && prize.awards.length > 0) {
        // Get unique award values for this prize, but only for available awards
        const uniqueValues = new Set(
          prize.awards
            .filter(award => award.available)
            .map(award => award.value)
        );

        uniqueValues.forEach(value => {
          // Find the first available award with this value to get the awardId
          const award = prize.awards!.find(a => a.value === value && a.available);
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
      } else {
        // If no awards, still show the prize with value 0
        combinations.push({
          id: `${prize.id}-0`,
          prizeId: prize.id,
          awardValue: 0,
          prize,
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
  }, [prizes, preferenceMap]);

  const [prizeAwardCombinations, setPrizeAwardCombinations] = useState<PrizeAwardCombination[]>([]);

  // Update combinations when prizes change
  useEffect(() => {
    setPrizeAwardCombinations(initialCombinations);
  }, [initialCombinations]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to save the current order of preferences with debouncing
  const savePreferencesOrder = (orderedCombinations: PrizeAwardCombination[]) => {
    if (!selectedPlayer) return;

    // Filter out combinations without awardId (prizes with no awards)
    const validCombinations = orderedCombinations.filter(c => c.awardId);

    if (validCombinations.length === 0) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save to avoid rapid API calls
    saveTimeoutRef.current = setTimeout(() => {
      saveAwardPreferences({
        items: validCombinations.map((combination, index) => ({
          playerId: selectedPlayer.id,
          awardId: combination.awardId!,
          preferenceOrder: index + 1,
        })),
      });
    }, 300);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = prizeAwardCombinations.findIndex((item) => item.id === active.id);
      const newIndex = prizeAwardCombinations.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(prizeAwardCombinations, oldIndex, newIndex);

      setPrizeAwardCombinations(newItems);
      savePreferencesOrder(newItems);
    }
  }

  function moveItem(id: string, direction: 'up' | 'down') {
    setPrizeAwardCombinations((items) => {
      const currentIndex = items.findIndex((item) => item.id === id);
      if (currentIndex === -1) return items;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= items.length) return items;

      const newItems = arrayMove(items, currentIndex, newIndex);

      // Save after state update
      savePreferencesOrder(newItems);

      return newItems;
    });
  }

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
    )
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-[700px]">
        {/* Player Selector */}
        {!isLoadingPlayers && <PlayerSelect variant="standalone" />}

        {selectedPlayer && (<div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Available Prizes</h1>
          <p className="text-sm text-muted-foreground">
            Only showing prizes that are still available to win.
            Drag items or use arrows to sort your prize preferences.
          </p>
        </div>)}

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

        {/* Prize List - Only show if player is selected */}
        {selectedPlayer && (
          <>
            {prizeAwardCombinations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No prizes available
              </div>
            ) : (
              <>
                {/* Order Indicator Label */}
                <div className="mb-4 flex justify-end">
                  {awardPreferences.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">Sorted by your preference</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ArrowDownAZ className="w-4 h-4" />
                      <span className="text-sm">Sorted by recommendation</span>
                    </div>
                  )}
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={prizeAwardCombinations.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-4">
                      {prizeAwardCombinations.map((combination, index) => {
                        const preferenceOrder = preferenceMap?.get(combination.id);
                        const showRibbon = index < 3 && preferenceOrder !== undefined;

                        return (
                          <SortablePrizeItem
                            key={combination.id}
                            combination={combination}
                            onMoveUp={() => moveItem(combination.id, 'up')}
                            onMoveDown={() => moveItem(combination.id, 'down')}
                            isFirst={index === 0}
                            isLast={index === prizeAwardCombinations.length - 1}
                            preferenceOrder={showRibbon ? preferenceOrder : undefined}
                            index={index}
                          />
                        );
                      })}
                    </ul>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage
