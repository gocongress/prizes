import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BreadcrumbItem } from '@/contexts/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import type { Event } from '@/hooks/use-events';
import { useEvents } from '@/hooks/use-events';
import { useSelfRegistration } from '@/hooks/use-self-registration';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Calendar, Check, ExternalLink, LogIn, Loader2, UserMinus, UserPlus } from 'lucide-react';
import { useEffect } from 'react';

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export interface EventsPageProps {
  breadcrumbs?: BreadcrumbSegment[];
  showCallToAction?: boolean;
}

function EventsPage({ breadcrumbs, showCallToAction = true }: EventsPageProps) {
  const { setBreadcrumbs } = useBreadcrumb();
  const { events, isLoading } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { register, unregister, isLoading: isRegistrationLoading } = useSelfRegistration();
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(
        breadcrumbs.map((bc) => ({ title: bc.label, href: bc.href }) as BreadcrumbItem),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEventClick = (eventSlug: string) => {
    // Determine if we're in the dashboard context by checking the current route
    const isDashboard =
      routerState.location.pathname.startsWith('/_dashboard') ||
      routerState.location.pathname.startsWith('/dashboard') ||
      routerState.location.pathname.startsWith('/events') ||
      routerState.location.pathname.startsWith('/my-prizes');

    if (isDashboard) {
      navigate({ to: '/events/$slug', params: { slug: eventSlug } });
    } else {
      navigate({ to: '/event/$slug', params: { slug: eventSlug } });
    }
  };

  // Check if any of the user's players is registered for a given event
  const isPlayerRegisteredForEvent = (event: Event): boolean => {
    if (!user?.players) return false;
    return user.players.some((player) => player.events?.some((e) => e.id === event.id));
  };

  // Get the first player that is registered for the event (for unregistration)
  const getRegisteredPlayer = (event: Event) => {
    if (!user?.players) return null;
    return user.players.find((player) => player.events?.some((e) => e.id === event.id)) || null;
  };

  // Get the first player available for registration
  const getFirstPlayer = () => {
    return user?.players?.[0] || null;
  };

  const handleSelfRegister = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const player = getFirstPlayer();
    if (!player) return;

    await register({ eventId: event.id, playerId: player.id });
  };

  const handleSelfUnregister = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const player = getRegisteredPlayer(event);
    if (!player) return;

    await unregister({ eventId: event.id, playerId: player.id });
  };

  if (isLoading) {
    return (
      <div className="flex pt-12 justify-center min-h-[calc(100vh-4rem)] min-w-full">
        <div className="flex flex-col space-y-3 min-w-full max-w-4xl w-full px-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Events Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        </div>

        {events.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground text-center">
                There are no events scheduled at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isRegistered = isPlayerRegisteredForEvent(event);
              const canSelfRegister = event.selfRegistrationEnabled && isAuthenticated && user?.players?.length;

              return (
                <Card
                  key={event.id}
                  className="flex flex-col cursor-pointer transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-2"
                  onClick={() => handleEventClick(event.slug)}
                >
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.startAt)} - {formatDate(event.endAt)}
                      </div>
                      {event.registrationUrl && !event.selfRegistrationEnabled && (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Register for this event
                        </a>
                      )}
                    </CardDescription>
                  </CardHeader>
                  {event.description && (
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    </CardContent>
                  )}
                  {canSelfRegister && (
                    <CardContent className="pt-0">
                      {isRegistered ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => handleSelfUnregister(event, e)}
                          disabled={isRegistrationLoading}
                        >
                          {isRegistrationLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Registered</span>
                              <UserMinus className="w-4 h-4 ml-auto" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={(e) => handleSelfRegister(event, e)}
                          disabled={isRegistrationLoading}
                        >
                          {isRegistrationLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Register for this event
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {showCallToAction && events.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Card className="border-primary/20 bg-primary/5 inline-block">
              <CardContent className="py-2 px-8 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Registered for one of these tournaments?
                </h3>
                <p className="text-muted-foreground mb-4">Log in to set your prize preferences.</p>
                <Button asChild size="lg">
                  <Link to="/login">
                    <LogIn />
                    Log In and Choose Prizes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
