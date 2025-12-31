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
  const availableEvents = useMemo(
    () => selectedPlayer?.events || [],
    [selectedPlayer?.events],
  );

  // Auto-select the first event if there's only one
  useEffect(() => {
    if (availableEvents.length === 1 && !selectedEvent) {
      setSelectedEvent(availableEvents[0]);
    }
  }, [availableEvents, selectedEvent]);

  // Clear selection if the selected event is no longer in the list
  useEffect(() => {
    if (selectedEvent && !availableEvents.find((e) => e.id === selectedEvent.id)) {
      setSelectedEvent(null);
    }
  }, [availableEvents, selectedEvent]);

  // Clear selection when player changes
  useEffect(() => {
    setSelectedEvent(null);
  }, [selectedPlayer?.id]);

  const value: EventContextValue = {
    selectedEvent,
    setSelectedEvent,
    availableEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
