import type { PlayerEvent } from '@/hooks/use-auth';
import { usePlayer } from '@/hooks/use-player';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface EventContextValue {
  selectedEvent: PlayerEvent | null;
  setSelectedEvent: (event: PlayerEvent) => void;
  availableEvents: PlayerEvent[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const EventContext = createContext<EventContextValue | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const { selectedPlayer } = usePlayer();
  const [selectedEvent, setSelectedEvent] = useState<PlayerEvent | null>(null);

  // Get available events from the selected player
  const availableEvents = useMemo(() => selectedPlayer?.events || [], [selectedPlayer?.events]);

  // Handle event selection logic when available events or player changes
  useEffect(() => {
    // Auto-select the first event if there's only one
    if (availableEvents.length === 1) {
      setSelectedEvent(availableEvents[0]);
      return;
    }

    // Clear selection if no events available
    if (availableEvents.length === 0) {
      setSelectedEvent(null);
      return;
    }

    // Clear selection if the selected event is no longer in the list
    setSelectedEvent((current) => {
      if (current && !availableEvents.find((e) => e.id === current.id)) {
        return null;
      }
      return current;
    });
  }, [availableEvents, selectedPlayer?.id]);

  const value: EventContextValue = {
    selectedEvent,
    setSelectedEvent,
    availableEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
