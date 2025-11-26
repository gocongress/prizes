import { useContext } from 'react';
import { PlayerContext } from '@/contexts/player';

/**
 * React hook that provides player context
 *
 * @returns Player state and methods
 *
 * @example
 * ```tsx
 * const { players, selectedPlayer, setSelectedPlayer } = usePlayer();
 *
 * // Get all players
 * console.log(players);
 *
 * // Get the currently selected player
 * console.log(selectedPlayer);
 *
 * // Select a different player
 * setSelectedPlayer(players[0]);
 * ```
 */
export function usePlayer() {
  const context = useContext(PlayerContext);

  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context;
}
