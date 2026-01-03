import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventById } from '@/hooks/use-event-by-id';
import { usePrizesByEvent } from '@/hooks/use-prizes-by-event';
import { useParams } from '@tanstack/react-router';
import { CalendarDays, ExternalLink, Trophy } from 'lucide-react';

export function EventPage() {
  const { id } = useParams({ from: '/event/$id' });
  const { event, isLoading: eventLoading, isError: eventError, error: eventErrorMsg } = useEventById(id);
  const { prizes, isLoading: prizesLoading, isError: prizesError, error: prizesErrorMsg } = usePrizesByEvent(id);

  if (eventLoading || prizesLoading) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-muted-foreground">Loading event...</div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-destructive">
          Error loading event: {eventErrorMsg?.message || 'Event not found'}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-muted-foreground">Event not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">

        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{event.title}</h1>
          {event.description && (
            <p className="text-lg text-muted-foreground mb-4">{event.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Prizes Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Prizes
          </h2>

          {prizesError && (
            <div className="text-center text-destructive mb-4">
              Error loading prizes: {prizesErrorMsg?.message}
            </div>
          )}

          {!prizesLoading && prizes.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Trophy className="w-16 h-16 mx-auto opacity-50 mb-4" />
              <p>No prizes available for this event yet.</p>
            </div>
          )}

          {/* Prize Grid */}
          {prizes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {prizes.map((prize) => (
                <Card key={prize.id} className="group cursor-pointer hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-500 ease-in-out flex flex-col max-h-48 hover:max-h-[1000px] max-w-60 overflow-hidden pt-0 pb-6 gap-0">
                  {/* Prize Image */}
                  {prize.imageThumbnailEncoded ? (
                    <div className="w-full h-24 group-hover:h-64 overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-in-out">
                      <img
                        src={`data:${prize.imageType || 'image/png'};base64,${prize.imageThumbnailEncoded}`}
                        alt={prize.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between gap-2 min-h-[3rem]">
                      <span className="line-clamp-2">{prize.title}</span>
                      {prize.url && (
                        <a
                          href={prize.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-shrink-0"
                          aria-label={`Visit ${prize.title} link`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </CardTitle>
                    {prize.recommendedRank && prize.recommendedRank !== 'ALL' && (
                      <CardDescription className="text-xs">
                        Recommended for: {prize.recommendedRank}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <div>
                      {prize.description && (
                        <p className="text-sm text-muted-foreground">
                          {prize.description}
                        </p>
                      )}
                    </div>
                    {prize.awardsCount !== undefined && prize.awardsCount > 0 && (
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground font-medium">
                        {prize.awardsCount} {prize.awardsCount === 1 ? 'prize' : 'prizes'} available
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventPage;
