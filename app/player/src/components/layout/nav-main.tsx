import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import EventSelect from '@/components/ui/event-select';
import PlayerSelect from '@/components/ui/player-select';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useEvent } from '@/hooks/use-event';
import { usePlayer } from '@/hooks/use-player';
import { usePlayerAwards } from '@/hooks/use-player-awards';
import { Link } from '@tanstack/react-router';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { selectedEvent, setSelectedEvent, availableEvents } = useEvent();
  const { selectedPlayer } = usePlayer();
  const { awards } = usePlayerAwards(selectedPlayer?.id);

  return (
    <SidebarGroup>
      {/* User Player Menu */}
      <SidebarGroupLabel>Player</SidebarGroupLabel>
      <PlayerSelect />
      {availableEvents.length > 0 && (
        <>
          <SidebarGroupLabel>Event</SidebarGroupLabel>
          <EventSelect
            variant="sidebar"
            events={availableEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
        </>
      )}
      <SidebarSeparator className="m-4" />
      <SidebarMenu>
        {items.map((item) => {
          const isMyPrizes = item.title === 'My Prizes';
          const prizeCount = isMyPrizes ? awards.length : 0;

          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                    {isMyPrizes && prizeCount > 0 && (
                      <Badge className="ml-auto bg-blue-500 text-white border-transparent hover:bg-blue-600">
                        {prizeCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
