import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, GripVertical, HelpCircle } from 'lucide-react';

export function PrizeRankingHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Help"
          className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to Rank Your Prizes</DialogTitle>
          <DialogDescription>
            Reorder prizes to indicate which ones you prefer most.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-muted rounded">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Drag Handle</p>
              <p className="text-sm text-muted-foreground">
                Click and drag the grip icon on the left side of any prize to move it up or down in
                the list. This works great on desktop.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-muted rounded">
              <div className="flex flex-col gap-0.5">
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="font-medium">Arrow Buttons</p>
              <p className="text-sm text-muted-foreground">
                Use the up and down arrow buttons on the right side of each prize to move it one
                position at a time. This is ideal for mobile or precise adjustments.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground border-t pt-4">
            Your preferences are saved automatically as you make changes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
