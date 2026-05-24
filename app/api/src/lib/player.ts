export const convertStringRankToNumber = (playingRank: string): number | undefined => {
  const normalized = playingRank.toLowerCase().trim();

  const match = normalized.match(/^(\d+)\s*(dan|kyu)$/);
  if (!match) {
    return;
  }

  const [, digits, rank] = match;
  const value = parseInt(digits, 10);
  return rank === 'dan' ? value : value * -1;
};
