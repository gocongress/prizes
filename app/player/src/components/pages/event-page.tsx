import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventBySlug } from '@/hooks/use-event-by-slug';
import { usePrizesByEvent } from '@/hooks/use-prizes-by-event';
import { useParams } from '@tanstack/react-router';
import { CalendarDays, ExternalLink, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

export function EventPage() {
  const { slug } = useParams({ from: '/event/$slug' });
  const {
    event,
    isLoading: eventLoading,
    isError: eventError,
    error: eventErrorMsg,
  } = useEventBySlug(slug);
  const {
    prizes,
    isLoading: prizesLoading,
    isError: prizesError,
    error: prizesErrorMsg,
  } = usePrizesByEvent(event?.id);
  const [touchedCard, setTouchedCard] = useState<string | null>(null);

  const availablePrizes = useMemo(() => {
    return prizes
      .filter((p) => p.awardsCount && p.awardsCount > 0)
      .sort((a, b) => (b.awardsSum || 0) - (a.awardsSum || 0));
  }, [prizes]);

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
                {new Date(event.startAt).toLocaleDateString()} -{' '}
                {new Date(event.endAt).toLocaleDateString()}
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

          {!prizesLoading && availablePrizes.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Trophy className="w-16 h-16 mx-auto opacity-50 mb-4" />
              <p>No prizes available for this event yet.</p>
            </div>
          )}

          {/* Prize Grid */}
          {availablePrizes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {availablePrizes.map((prize) => {
                const isTouched = touchedCard === prize.id;
                return (
                  <Card
                    key={prize.id}
                    className={`group cursor-pointer hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 hover:max-h-[1000px] transition-all duration-500 ease-in-out flex flex-col w-90 sm:w-50 overflow-hidden pt-0 pb-3 gap-0 rounded-md ${
                      isTouched
                        ? 'shadow-xl border-blue-500 -translate-y-2 max-h-[1000px]'
                        : 'max-h-48'
                    }`}
                    onClick={() => {
                      if (prize.url) {
                        window.open(prize.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    onTouchStart={() => setTouchedCard(prize.id)}
                    onTouchEnd={() => setTouchedCard(null)}
                    onTouchCancel={() => setTouchedCard(null)}
                  >
                    {/* Prize Image */}
                    {prize.imageThumbnailEncoded ? (
                      <div
                        className={`w-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-in-out ${
                          isTouched ? 'h-64' : 'h-24 group-hover:h-64'
                        }`}
                      >
                        <img
                          src={`data:${prize.imageType || 'image/png'};base64,${prize.imageThumbnailEncoded}`}
                          alt={prize.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-16 h-16 text-gray-300" />
                      </div>
                    )}

                    <CardHeader className="px-3 gap-0">
                      <CardTitle className="flex flex-col">
                        <div className="flex justify-between w-full items-center min-h-[2.5rem]">
                          <span className="line-clamp-2 text-sm font-semibold">{prize.title}</span>
                          {prize.url && (
                            <ExternalLink className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                          )}
                        </div>
                        {prize.sponsor && (
                          <p
                            className={`text-xs text-muted-foreground italic font-normal pb-2 ${
                              isTouched
                                ? 'whitespace-normal max-w-full'
                                : 'max-w-44 truncate group-hover:whitespace-normal group-hover:max-w-full'
                            }`}
                          >
                            {prize.sponsor}
                          </p>
                        )}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-between pt-0 px-3">
                      <div className="min-h-20">
                        {prize.description && (
                          <p className="text-sm text-muted-foreground">{prize.description}</p>
                        )}
                      </div>
                      {prize.awardsCount !== undefined && prize.awardsCount > 1 && (
                        <div className="mt-2 flex justify-center">
                          <Badge className="bg-blue-500 text-white border-transparent hover:bg-blue-100">
                            {prize.awardsCount} available
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventPage;
