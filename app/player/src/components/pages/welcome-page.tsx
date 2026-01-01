import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/use-events';
import { Link } from '@tanstack/react-router';
import { Calendar, LogIn } from 'lucide-react';

function WelcomePage() {
  const { events, isLoading } = useEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event.startAt)} - {formatDate(event.endAt)}
                  </CardDescription>
                </CardHeader>
                {event.description && (
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {events.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-8">
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

export default WelcomePage;
