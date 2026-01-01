import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PlayerEvent } from '@/hooks/use-auth';
import { Calendar, ChevronsUpDown } from 'lucide-react';

interface EventSelectProps {
  events: PlayerEvent[];
  selectedEvent: PlayerEvent | null;
  onSelectEvent: (event: PlayerEvent) => void;
}

function EventSelect({ events, selectedEvent, onSelectEvent }: EventSelectProps) {
  if (events.length === 0) return null;

  // Single event - just display it
  if (events.length === 1) {
    const startDate = new Date(events[0].startAt).toLocaleDateString();
    const endDate = new Date(events[0].endAt).toLocaleDateString();

    return (
      <div className="mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{events[0].title}</div>
          <div className="text-sm text-muted-foreground">
            {startDate} - {endDate}
          </div>
        </div>
      </div>
    );
  }

  // Multiple events - show dropdown
  const selectedStartDate = selectedEvent
    ? new Date(selectedEvent.startAt).toLocaleDateString()
    : '';
  const selectedEndDate = selectedEvent ? new Date(selectedEvent.endAt).toLocaleDateString() : '';

  return (
    <div className="mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3 hover:border-primary/50 hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{selectedEvent?.title || 'Select an Event'}</div>
              <div className="text-sm text-muted-foreground">
                {selectedEvent ? `${selectedStartDate} - ${selectedEndDate}` : 'Choose an event'}
              </div>
            </div>
            <ChevronsUpDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[400px]" align="start">
          <DropdownMenuLabel>Select Event</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {events.map((event) => (
            <DropdownMenuItem
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className={selectedEvent?.id === event.id ? 'bg-accent' : ''}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{event.title}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default EventSelect;
