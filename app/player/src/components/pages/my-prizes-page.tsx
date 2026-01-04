import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePlayer } from '@/hooks/use-player';
import { usePlayerAwards } from '@/hooks/use-player-awards';
import { ExternalLink, Medal, Trophy } from 'lucide-react';
import { useEffect } from 'react';

export function MyPrizesPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { selectedPlayer } = usePlayer();
  const { awards, isLoading, isError, error } = usePlayerAwards(selectedPlayer?.id);

  useEffect(() => {
    setBreadcrumbs([{ title: 'My Prizes', href: '/my-prizes' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedPlayer) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-muted-foreground">
          Please select a player to view their prizes
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-muted-foreground">Loading prizes...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-destructive">Error loading prizes: {error?.message}</div>
      </div>
    );
  }

  if (awards.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <div className="text-center text-muted-foreground space-y-4">
          <Trophy className="w-16 h-16 mx-auto opacity-50" />
          <div>
            <h3 className="font-semibold text-lg">No prizes yet</h3>
            <p className="text-sm">
              {selectedPlayer.name} hasn't won any prizes yet. Keep playing!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
          My Prizes
          <Badge className="bg-blue-500 text-white border-transparent">{awards.length}</Badge>
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {awards.map((award) => (
          <Card key={award.id} className="hover:shadow-md transition-shadow w-full">
            <div className="flex gap-4">
              {/* Left column: Header and Content */}
              <div className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Medal className="w-5 h-5" />
                    {award.prize?.title || 'Prize'}
                    {award.prize?.url && (
                      <a
                        href={award.prize.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardTitle>
                  {award.prize?.eventTitle && (
                    <CardDescription className="mt-1 text-lg">
                      {award.prize.eventTitle}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {award.prize?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 pt-2">
                      {award.prize.description}
                    </p>
                  )}

                  {award.redeemCode && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Redeem Code:</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{award.redeemCode}</code>
                    </div>
                  )}
                  {award.value !== null && award.value !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Retail Value:</span>
                      <span className="text-sm text-muted-foreground">${award.value}</span>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Right column: Thumbnail */}
              {award.prize?.imageThumbnailEncoded && (
                <div className="flex items-center p-6">
                  <img
                    src={`data:${award.prize.imageType || 'image/png'};base64,${award.prize.imageThumbnailEncoded}`}
                    alt={award.prize.title}
                    className="w-24 h-24 rounded object-cover"
                  />
                </div>
              )}
            </div>

            {/* Footer spanning full width */}
            {award.updatedAt && (
              <div className="px-5 pt-3 border-t text-xs text-muted-foreground">
                Awarded on {new Date(award.updatedAt).toLocaleDateString()}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyPrizesPage;
