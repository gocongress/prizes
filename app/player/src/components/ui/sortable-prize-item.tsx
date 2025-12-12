import type { PrizeAwardCombination } from '@/hooks/use-prizes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, ChevronsDownUp, ExternalLink, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface SortablePrizeItemProps {
  combination: PrizeAwardCombination;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  preferenceOrder?: number;
  index: number;
}

function SortablePrizeItem({
  combination,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  preferenceOrder,
  index,
}: SortablePrizeItemProps) {
  const { prize, awardValue } = combination;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: combination.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    overflow: 'visible',
  };

  const thumbnailSrc =
    prize.imageThumbnailEncoded && prize.imageType
      ? `data:${prize.imageType};base64,${prize.imageThumbnailEncoded}`
      : null;

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="border border-gray-200 dark:border-gray-700 bg-sidebar dark:bg-slate-800 rounded-lg p-4 flex gap-3 hover:border-primary/50 hover:shadow-md hover:bg-white dark:hover:bg-slate-750 transition-all cursor-move touch-none shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] relative overflow-hidden"
    >
      {/* Diagonal Preference Order Ribbon */}
      {preferenceOrder !== undefined && index < 3 && (
        <div className="absolute -left-1.5 -top-1.5 z-10 overflow-hidden w-[4.5rem] h-[4.5rem] text-left">
          <span className="text-sm font-bold text-white uppercase text-center leading-5 -rotate-45 w-24 block bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_3px_10px_-5px_rgba(0,0,0,1)] absolute top-[1.125rem] -left-5 before:content-[''] before:absolute before:right-0 before:top-full before:-z-10 before:border-r-[3px] before:border-r-amber-600 before:border-l-[3px] before:border-l-transparent before:border-b-[3px] before:border-b-transparent before:border-t-[3px] before:border-t-amber-600 after:content-[''] after:absolute after:left-0 after:top-full after:-z-10 after:border-r-[3px] after:border-r-transparent after:border-l-[3px] after:border-l-amber-600 after:border-b-[3px] after:border-b-transparent after:border-t-[3px] after:border-t-amber-600">
            #{index + 1}
          </span>
        </div>
      )}
      <div className="flex-shrink-0 self-start p-1.5 bg-white dark:bg-gray-100 rounded shadow-md border border-gray-200">
        {thumbnailSrc && (
          <img src={thumbnailSrc} alt={prize.title} className="w-18 h-18 object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <span>{prize.title}</span>
          {prize.url && (
            <a
              href={prize.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Open link for ${prize.title}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </h3>
        <div className="mb-2 min-h-[30px]">
          {prize.description && (
            <>
              <div
                className={`text-xs text-muted-foreground whitespace-pre-wrap ${!isDescriptionExpanded ? 'max-h-[50px] overflow-hidden' : ''
                  }`}
              >
                {!isDescriptionExpanded && prize.description.length > 200
                  ? prize.description.substring(0, 200) + '...'
                  : prize.description}
              </div>
              {(prize.description.length > 200 || prize.description.split('\n').length > 3) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 w-full mt-2 group cursor-pointer"
                  type="button"
                >
                  <div className="flex-1 h-px bg-border group-hover:bg-primary/50 transition-colors" />
                  <ChevronsDownUp className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1 h-px bg-border group-hover:bg-primary/50 transition-colors" />
                </button>
              )}
            </>
          )}
        </div>
        {prize.eventTitle && (
          <div className="flex gap-4 text-sm mb-3">
            <span className="text-muted-foreground">Event: {prize.eventTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-green-700 dark:text-green-500 font-semibold">
            <span>Retail value:</span>
            <span>
              $
              {awardValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {prize.recommendedRank !== 'ALL' && (
            <span className="text-muted-foreground">
              Suggested for{' '}
              {prize.recommendedRank === 'SDK' || prize.recommendedRank === 'DDK'
                ? 'KYU'
                : prize.recommendedRank}{' '}
              players
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-20">
        <div className="flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
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
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
    </li>
  );
}

export default SortablePrizeItem;
