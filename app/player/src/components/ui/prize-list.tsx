import SortIndicator from '@/components/ui/sort-indicator';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, ExternalLink, GripVertical, Trophy } from 'lucide-react';
import { useState } from 'react';

interface PrizeListProps {
  prizeAwardCombinations: PrizeAwardCombination[];
  onReorder: (newCombinations: PrizeAwardCombination[]) => void;
  hasAwardPreferences: boolean;
  onResetToRecommended: () => void;
  isResetting?: boolean;
}

interface SortableRowProps {
  combination: PrizeAwardCombination;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showRankBadge: boolean;
}

function SortableRow({
  combination,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  isExpanded,
  onToggleExpand,
  showRankBadge,
}: SortableRowProps) {
  const { prize, awardValue } = combination;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: combination.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const thumbnailSrc =
    prize.imageThumbnailEncoded && prize.imageType
      ? `data:${prize.imageType};base64,${prize.imageThumbnailEncoded}`
      : null;

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${isDragging ? 'bg-gray-100 dark:bg-slate-700' : ''}`}
      >
        {/* Rank */}
        <td className="py-2 px-2 text-center w-12">
          {index < 3 && showRankBadge ? (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold">
              {index + 1}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
          )}
        </td>

        {/* Drag Handle */}
        <td className="py-2 px-1 w-8">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none flex items-center justify-center"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </td>

        {/* Prize Name (clickable to expand) */}
        <td
          className="py-2 px-2 cursor-pointer"
          onClick={onToggleExpand}
          onKeyDown={(e) => e.key === 'Enter' && onToggleExpand()}
          tabIndex={0}
          role="button"
        >
          <div className="flex items-center gap-3">
            {thumbnailSrc ? (
              <div className="flex-shrink-0 bg-white dark:bg-gray-100 rounded shadow-sm border border-gray-200 p-0.5">
                <img src={thumbnailSrc} alt={prize.title} className="w-8 h-8 object-cover" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <Trophy className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <span className="font-medium text-sm truncate max-w-[200px] sm:max-w-none">
              {prize.title}
            </span>
            {prize.url && (
              <a
                href={prize.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label={`Open link for ${prize.title}`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </td>

        {/* Value */}
        <td className="py-2 px-2 text-right w-24">
          <span className="text-sm text-green-700 dark:text-green-500 font-medium">
            $
            {awardValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </td>

        {/* Move Buttons */}
        <td className="py-2 px-1 w-16">
          <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={isFirst}
              className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Move up"
              type="button"
            >
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={isLast}
              className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Move down"
              type="button"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-gray-50 dark:bg-slate-800/30">
          <td colSpan={5} className="py-3 px-4">
            <div className="flex gap-4">
              {thumbnailSrc && (
                <div className="flex-shrink-0 bg-white dark:bg-gray-100 rounded shadow-sm border border-gray-200 p-1">
                  <img src={thumbnailSrc} alt={prize.title} className="w-20 h-20 object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-sm flex flex-col justify-center">
                {prize.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap">{prize.description}</p>
                )}
                {prize.sponsor && (
                  <p className="text-muted-foreground italic pt-2">
                    Sponsored by{' '}
                    {prize.url ? (
                      <a
                        href={prize.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline transition-colors inline-flex items-center gap-1"
                      >
                        {prize.sponsor}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      prize.sponsor
                    )}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function PrizeList({
  prizeAwardCombinations,
  onReorder,
  hasAwardPreferences,
  onResetToRecommended,
  isResetting = false,
}: PrizeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (prizeAwardCombinations.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No prizes available</div>;
  }

  return (
    <div>
      {/* Order Indicator Label */}
      <div className="mb-3 flex justify-end">
        <SortIndicator
          hasAwardPreferences={hasAwardPreferences}
          onResetToRecommended={onResetToRecommended}
          isResetting={isResetting}
        />
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={prizeAwardCombinations.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2 px-2 text-xs font-medium text-muted-foreground text-center w-12">
                    #
                  </th>
                  <th className="py-2 px-1 w-8" />
                  <th className="py-2 px-2 text-xs font-medium text-muted-foreground text-left">
                    Prize
                  </th>
                  <th className="py-2 px-2 text-xs font-medium text-muted-foreground text-right w-24">
                    Value
                  </th>
                  <th className="py-2 px-1 w-16" />
                </tr>
              </thead>
              <tbody>
                {prizeAwardCombinations.map((combination, index) => (
                  <SortableRow
                    key={combination.id}
                    combination={combination}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === prizeAwardCombinations.length - 1}
                    onMoveUp={() => moveItem(combination.id, 'up')}
                    onMoveDown={() => moveItem(combination.id, 'down')}
                    isExpanded={expandedId === combination.id}
                    onToggleExpand={() => toggleExpand(combination.id)}
                    showRankBadge={hasAwardPreferences}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Click a row to see details. Drag or use arrows to reorder.
      </p>
    </div>
  );
}

export default PrizeList;
