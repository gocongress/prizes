import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import type { PlayerEvent } from '@/hooks/use-auth';
import { Calendar, ChevronsUpDown } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

interface EventSelectProps {
  events: PlayerEvent[];
  selectedEvent: PlayerEvent | null;
  onSelectEvent: (event: PlayerEvent) => void;
  variant?: 'sidebar' | 'standalone';
}

function EventSelect({
  events,
  selectedEvent,
  onSelectEvent,
  variant = 'standalone',
}: EventSelectProps) {
  const { isMobile } = useSidebar();

  if (events.length === 0) return null;

  const hasMultipleEvents = events.length > 1;

  // Standalone variant for use outside sidebar
  if (variant === 'standalone') {
    // Single event - just display it
    if (events.length === 1) {
      const startDate = new Date(events[0].startAt).toLocaleDateString();
      const endDate = new Date(events[0].endAt).toLocaleDateString();

      return (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
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
            <button className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
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

  return (
    <Fragment>
      <SidebarMenuItem>
        {hasMultipleEvents ? (
          // Multiple events - show dropdown selector
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={`cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`}
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className={`truncate font-medium`}>
                    {selectedEvent?.title || 'Select Event'}
                  </span>
                  {selectedEvent && (
                    <span className="truncate text-xs text-muted-foreground">
                      {new Date(selectedEvent.startAt).toLocaleDateString()} -{' '}
                      {new Date(selectedEvent.endAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className={`ml-auto size-4`} />
                {!selectedEvent && <div className="ml-1 h-2 w-2 rounded-full bg-blue-500" />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={`w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg`}
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs">Select Event</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {events.map((event) => (
                <DropdownMenuItem
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={selectedEvent?.id === event.id ? 'bg-accent' : ''}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.startAt).toLocaleDateString()} -{' '}
                      {new Date(event.endAt).toLocaleDateString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Single event - just show details
          <SidebarMenuButton
            size="lg"
            className="hover:bg-transparent hover:text-sidebar-foreground pointer-events-none"
          >
            <Calendar className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{events[0].title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {new Date(events[0].startAt).toLocaleDateString()} -{' '}
                {new Date(events[0].endAt).toLocaleDateString()}
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </Fragment>
  );
}

export default EventSelect;
