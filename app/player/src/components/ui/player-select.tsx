import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { usePlayer } from '@/hooks/use-player';
import { AlertCircleIcon, ChevronsUpDown, ContactRound, UserCircle2 } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

interface PlayerSelectProps {
  variant?: 'sidebar' | 'standalone';
}

function PlayerSelect({ variant = 'sidebar' }: PlayerSelectProps) {
  const { isMobile } = useSidebar();
  const { players, selectedPlayer, setSelectedPlayer, isLoading } = usePlayer();

  // TODO: Render a spinner
  if (isLoading) return null;

  const hasMultiplePlayers = players.length > 1;

  // Standalone variant for use outside sidebar
  if (variant === 'standalone') {
    if (players.length === 0) return null;

    return (
      <div className="mb-6">
        {hasMultiplePlayers ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{selectedPlayer?.name || 'Select a Player'}</div>
                  {selectedPlayer?.rank && (
                    <div className="text-sm text-muted-foreground">
                      {selectedPlayer.agaId} - Rank: {selectedPlayer.rank}
                    </div>
                  )}
                </div>
                <ChevronsUpDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[400px]" align="start">
              <DropdownMenuLabel>Select Player</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {players.map((player) => (
                <DropdownMenuItem
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={selectedPlayer?.id === player.id ? 'bg-accent' : ''}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{player.name}</span>
                    {player.rank && (
                      <span className="text-xs text-muted-foreground">
                        {player.agaId} - Rank: {player.rank}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{players[0].name}</div>
              {players[0].rank && (
                <div className="text-sm text-muted-foreground">Rank: {players[0].rank}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant (original implementation)
  return (
    <Fragment>
      {/* Player Selector - Only show if there are players */}
      {players.length > 0 ? (
        <SidebarMenuItem>
          {hasMultiplePlayers ? (
            // Multiple players - show dropdown selector
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                    <UserCircle2 className="h-4 w-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className={`truncate font-medium`}>
                      {selectedPlayer?.name || 'Select Player'}
                    </span>
                    {selectedPlayer?.rank && (
                      <span className="truncate text-xs text-muted-foreground">
                        {selectedPlayer.agaId} - Rank: {selectedPlayer.rank}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className={`ml-auto size-4`} />
                  {!selectedPlayer && <div className="ml-1 h-2 w-2 rounded-full bg-blue-500" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg`}
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs">Select Player</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {players.map((player) => (
                  <DropdownMenuItem
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={selectedPlayer?.id === player.id ? 'bg-accent' : ''}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{player.name}</span>
                      {player.rank && (
                        <span className="text-xs text-muted-foreground">
                          {player.agaId} - Rank: {player.rank}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Single player - just show details
            <SidebarMenuButton size="lg">
              <ContactRound className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{players[0].name}</span>
                {players[0].rank && (
                  <span className="truncate text-xs text-muted-foreground">
                    Rank: {players[0].rank}
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ) : (
        // No players - show warning
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="opacity-100">
            <AlertCircleIcon className="h-8 w-8 rounded-lg text-destructive" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-destructive">No Players Setup</span>
              <span className="truncate text-xs text-muted-foreground">Contact support.</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </Fragment>
  );
}

export default PlayerSelect;
