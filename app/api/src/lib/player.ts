export const convertStringRankToNumber = (playingRank: string): number => {
  const normalized = playingRank.toLowerCase().trim();

  const match = normalized.match(/^(\d+)\s*(dan|kyu)$/);
  if (!match) {
    throw new Error(`Invalid playing rank: ${playingRank}`);
  }

  const [, digits, rank] = match;
  const value = parseInt(digits, 10);
  return rank === 'dan' ? value : value * -1;
};
