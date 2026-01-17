import { ArrowDownAZ, RotateCcw, Star } from 'lucide-react';

interface SortIndicatorProps {
  hasAwardPreferences: boolean;
  onResetToRecommended: () => void;
  isResetting?: boolean;
}

export function SortIndicator({
  hasAwardPreferences,
  onResetToRecommended,
  isResetting = false,
}: SortIndicatorProps) {
  if (hasAwardPreferences) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">Sorted by your preference</span>
        </div>
        <button
          type="button"
          onClick={onResetToRecommended}
          disabled={isResetting}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <ArrowDownAZ className="w-4 h-4" />
      <span className="text-sm">Sorted by recommendation</span>
    </div>
  );
}

export default SortIndicator;
