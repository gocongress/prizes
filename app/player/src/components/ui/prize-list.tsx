import SortablePrizeItem from '@/components/ui/sortable-prize-item';
import type { PrizeAwardCombination } from '@/hooks/use-prizes';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowDownAZ, Star } from 'lucide-react';

interface PrizeListProps {
  prizeAwardCombinations: PrizeAwardCombination[];
  onReorder: (newCombinations: PrizeAwardCombination[]) => void;
  preferenceMap: Map<string, number> | null;
  hasAwardPreferences: boolean;
}

export function PrizeList({
  prizeAwardCombinations,
  onReorder,
  preferenceMap,
  hasAwardPreferences,
}: PrizeListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = prizeAwardCombinations.findIndex((item) => item.id === active.id);
      const newIndex = prizeAwardCombinations.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(prizeAwardCombinations, oldIndex, newIndex);
      onReorder(newItems);
    }
  }

  function moveItem(id: string, direction: 'up' | 'down') {
    const currentIndex = prizeAwardCombinations.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= prizeAwardCombinations.length) return;

    const newItems = arrayMove(prizeAwardCombinations, currentIndex, newIndex);
    onReorder(newItems);
  }

  if (prizeAwardCombinations.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No prizes available</div>;
  }

  return (
    <>
      {/* Order Indicator Label */}
      <div className="mb-4 flex justify-end">
        {hasAwardPreferences ? (
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
  );
}

export default PrizeList;
