import { useContext } from 'react';
import { EventContext } from '@/contexts/event';

/**
 * React hook that provides event context
 *
 * @returns Event state and methods
 *
 * @example
 * ```tsx
 * const { availableEvents, selectedEvent, setSelectedEvent } = useEvent();
 *
 * // Get all available events for the selected player
 * console.log(availableEvents);
 *
 * // Get the currently selected event
 * console.log(selectedEvent);
 *
 * // Select a different event
 * setSelectedEvent(availableEvents[0]);
 * ```
 */
export function useEvent() {
  const context = useContext(EventContext);

  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }

  return context;
}
