import { useAuth, type Player } from '@/hooks/use-auth';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface PlayerContextValue {
  players: Player[];
  selectedPlayer: Player | undefined;
  setSelectedPlayer: (player: Player) => void;
  isLoading: boolean;
}

export const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const { auth } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();

  // Memoize the list of players for the current user
  const players = useMemo(() => auth.user?.players || [], [auth.user?.players]);

  // Auto-select the first player if there's only one
  useEffect(() => {
    if (players.length === 1 && !selectedPlayer) {
      setSelectedPlayer(players[0]);
    }
  }, [players, selectedPlayer]);

  // Clear selection if the selected player is no longer in the list
  useEffect(() => {
    if (selectedPlayer && !players.find(p => p.id === selectedPlayer.id)) {
      setSelectedPlayer(undefined);
    }
  }, [players, selectedPlayer]);

  const value: PlayerContextValue = {
    players,
    selectedPlayer,
    setSelectedPlayer,
    isLoading: auth.isLoading,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
