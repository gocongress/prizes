import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/contexts/breadcrumb';
import { env } from '@/env';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { useEventBySlug } from '@/hooks/use-event-by-slug';
import { usePrizesByEvent } from '@/hooks/use-prizes-by-event';
import { useParams } from '@tanstack/react-router';
import { ArrowDownAZ, ArrowDownWideNarrow, CalendarDays, ExternalLink, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SortOrder = 'totalValue' | 'sponsorName';

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface EventPageProps {
  slug?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

const getExtensionFromMimeType = (mimeType: string): string | null => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
  };

  return mimeMap[mimeType.toLowerCase()] || null;
};

export function EventSponsorsPage({ slug: slugProp, breadcrumbs }: EventPageProps = {}) {
  const { setBreadcrumbs } = useBreadcrumb();
  // Try to get slug from props first, fallback to route params
  const routeParams = useParams({ strict: false });
  const slug = slugProp || (routeParams as { slug?: string })?.slug || '';
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('totalValue');

  useEffect(() => {
    if (breadcrumbs && event) {
      const crumbs: BreadcrumbItem[] = [
        ...breadcrumbs.map((bc) => ({ title: bc.label, href: bc.href || '' })),
        { title: event.title, href: '' },
      ];
      setBreadcrumbs(crumbs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.title]);

  const availablePrizes = useMemo(() => {
    return prizes
      .filter((p) => p.awardsCount && p.awardsCount > 0)
      .sort((a, b) => (b.awardsSum || 0) - (a.awardsSum || 0));
  }, [prizes]);

  // Group prizes by sponsor
  const prizesBySponsor = useMemo(() => {
    const grouped = new Map<string, typeof prizes>();

    availablePrizes.forEach((prize) => {
      const sponsor = prize.sponsor || 'No Sponsor Listed';
      if (!grouped.has(sponsor)) {
        grouped.set(sponsor, []);
      }
      grouped.get(sponsor)!.push(prize);
    });

    const sponsorGroups = Array.from(grouped.entries()).map(([sponsor, prizes]) => ({
      sponsor,
      prizes,
      totalValue: prizes.reduce((sum, p) => sum + (p.awardsSum || 0), 0),
    }));

    if (sortOrder === 'sponsorName') {
      return sponsorGroups.sort((a, b) => a.sponsor.localeCompare(b.sponsor));
    }
    // Default: sort by total value (highest first)
    return sponsorGroups.sort((a, b) => b.totalValue - a.totalValue);
  }, [availablePrizes, sortOrder]);

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
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {new Date(event.startAt).toLocaleDateString()} -{' '}
                {new Date(event.endAt).toLocaleDateString()}
              </span>
            </div>
            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Register for this event
              </a>
            )}
          </div>
        </div>

        {/* Prizes Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Prizes
            </h2>
            {prizesBySponsor.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="flex gap-1">
                  <Button
                    variant={sortOrder === 'totalValue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortOrder('totalValue')}
                    className="gap-1"
                  >
                    <ArrowDownWideNarrow className="w-4 h-4" />
                    Value
                  </Button>
                  <Button
                    variant={sortOrder === 'sponsorName' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortOrder('sponsorName')}
                    className="gap-1"
                  >
                    <ArrowDownAZ className="w-4 h-4" />
                    Sponsor
                  </Button>
                </div>
              </div>
            )}
          </div>

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

          {/* Prize Cards Grouped by Sponsor */}
          {prizesBySponsor.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-center gap-4">
              {prizesBySponsor.map(({ sponsor, prizes }) => {
                // Use the first prize with an image for the sponsor card
                const sponsorPrize =
                  prizes.find((p) => p.imageThumbnailEncoded && p.imageType) || prizes[0];
                const sponsorCardId = `sponsor-${sponsor}`;
                const isExpanded = expandedCard === sponsorCardId;

                // Sort prizes by value (highest first)
                const sortedPrizes = [...prizes].sort((a, b) => {
                  const aValue =
                    a.awards && a.awards.length > 0
                      ? a.awards[0].value || 0
                      : a.awardsSum && (a.awardsCount || 0) > 0
                        ? a.awardsSum / (a.awardsCount || 1)
                        : 0;
                  const bValue =
                    b.awards && b.awards.length > 0
                      ? b.awards[0].value
                      : b.awardsSum && (b.awardsCount || 0) > 0
                        ? b.awardsSum / (b.awardsCount || 1)
                        : 0;
                  return (bValue || 0) - (aValue || 0);
                });

                return (
                  <Card
                    key={sponsorCardId}
                    className="group py-4 hover:shadow-lg transition-all duration-300 cursor-pointer w-full sm:min-w-[475px] sm:max-w-[480px]"
                    onClick={(e) => {
                      // Check if the click target is a link
                      const target = e.target as HTMLElement;
                      const isLink = target.closest('a');
                      if (!isLink) {
                        setExpandedCard(sponsorCardId);
                      }
                    }}
                  >
                    <CardContent className="px-4 py-0">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Left side: Sponsor image and info */}
                        <div className="flex flex-col items-center md:items-start w-full md:w-48 flex-shrink-0">
                          {/* Prize Image */}
                          {sponsorPrize.imageThumbnailEncoded && sponsorPrize.imageType ? (
                            <div
                              className={`relative w-full overflow-hidden bg-muted flex items-center justify-center rounded-md mb-2 transition-all duration-300 ${
                                isExpanded
                                  ? 'h-[250px]'
                                  : 'h-28 md:h-[120px] md:group-hover:h-[250px]'
                              }`}
                            >
                              <img
                                src={`${env.VITE_API_URL}/api/static/prizes/${sponsorPrize.id}.${getExtensionFromMimeType(sponsorPrize.imageType)}`}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-80"
                                aria-hidden="true"
                              />
                              <img
                                src={`${env.VITE_API_URL}/api/static/prizes/${sponsorPrize.id}.${getExtensionFromMimeType(sponsorPrize.imageType)}`}
                                alt={sponsor}
                                className="relative w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-full overflow-hidden bg-muted flex items-center justify-center rounded-md mb-2 h-28 md:h-[120px]">
                              <Trophy className="w-16 h-16 text-gray-300" />
                            </div>
                          )}

                          {/* Sponsor Info */}
                          <div className="text-center md:text-left w-full">
                            {sponsorPrize.url ? (
                              <div className="flex items-center justify-center md:justify-start gap-1">
                                <a
                                  href={sponsorPrize.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-semibold text-base text-blue-600 hover:text-blue-800 hover:underline transition-all overflow-hidden ${
                                    isExpanded ? '' : 'line-clamp-1 group-hover:line-clamp-none'
                                  }`}
                                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical' }}
                                >
                                  {sponsor}
                                </a>
                                <a
                                  href={sponsorPrize.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex text-blue-600 hover:text-blue-800 flex-shrink-0"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              <h3
                                className={`font-semibold text-base transition-all overflow-hidden ${
                                  isExpanded ? '' : 'line-clamp-1 group-hover:line-clamp-none'
                                }`}
                                style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical' }}
                              >
                                {sponsor}
                              </h3>
                            )}
                          </div>
                        </div>

                        {/* Right side: List of prizes */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-xs mb-1.5 text-muted-foreground uppercase tracking-wide">
                            Available Prizes
                          </h4>
                          <div className="space-y-2">
                            {sortedPrizes.map((prize) => {
                              const availableCount = prize.awardsCount || 0;
                              // Calculate value per award
                              const valuePerAward =
                                prize.awards && prize.awards.length > 0
                                  ? prize.awards[0].value
                                  : prize.awardsSum && availableCount > 0
                                    ? prize.awardsSum / availableCount
                                    : null;

                              return (
                                <div
                                  key={prize.id}
                                  className="group/prize flex items-start justify-between gap-3 pb-2 border-b last:border-b-0"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-1">
                                      {prize.url ? (
                                        <>
                                          <a
                                            href={prize.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-xs hover:underline text-blue-600 line-clamp-1"
                                          >
                                            {prize.title}
                                          </a>
                                          <a
                                            href={prize.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-shrink-0 text-blue-600 hover:text-blue-800"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </>
                                      ) : (
                                        <span className="font-medium text-xs line-clamp-1">
                                          {prize.title}
                                        </span>
                                      )}
                                    </div>
                                    {prize.description && (
                                      <p
                                        className={`text-xs text-muted-foreground mt-0.5 transition-all ${
                                          isExpanded
                                            ? 'line-clamp-none'
                                            : 'line-clamp-1 group-hover:line-clamp-none group-hover/prize:line-clamp-none'
                                        }`}
                                      >
                                        {prize.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                    {availableCount > 1 && (
                                      <Badge className="text-xs py-0 px-2 h-5 bg-blue-500 hover:bg-blue-600 text-white">
                                        {availableCount} prizes
                                      </Badge>
                                    )}
                                    {valuePerAward && (
                                      <span className="text-xs text-muted-foreground font-medium">
                                        ${valuePerAward.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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

export default EventSponsorsPage;
