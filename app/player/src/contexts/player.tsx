import { useAuth, type Player } from '@/hooks/use-auth';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface PlayerContextValue {
  players: Player[];
  selectedPlayer: Player | undefined;
  setSelectedPlayer: (player: Player) => void;
  isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const { auth } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();

  // Memoize the list of players for the current user
  const players = useMemo(() => auth.user?.players || [], [auth.user?.players]);

  // Sync selectedPlayer with fresh data when players array changes
  useEffect(() => {
    if (players.length === 0) {
      setSelectedPlayer(undefined);
      return;
    }

    // Auto-select the first player if none selected
    if (!selectedPlayer) {
      setSelectedPlayer(players[0]);
      return;
    }

    // Update selectedPlayer with fresh data from the players array
    const freshPlayer = players.find((p) => p.id === selectedPlayer.id);
    if (freshPlayer) {
      setSelectedPlayer(freshPlayer);
    } else {
      // Selected player no longer in list, select first available
      setSelectedPlayer(players[0]);
    }
  }, [players]);

  const value: PlayerContextValue = {
    players,
    selectedPlayer,
    setSelectedPlayer,
    isLoading: auth.isLoading,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
