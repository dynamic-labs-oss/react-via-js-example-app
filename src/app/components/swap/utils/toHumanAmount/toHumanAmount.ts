export const toHumanAmount = (
  rawAmount: string,
  decimals: number
): string => {
  if (!rawAmount || rawAmount === '0') return '0';

  const padded = rawAmount.padStart(decimals + 1, '0');
  const wholepart = padded.slice(0, padded.length - decimals);
  const fraction = padded.slice(padded.length - decimals);

  const trimmedFraction = fraction.replace(/0+$/, '');

  return trimmedFraction ? `${wholepart}.${trimmedFraction}` : wholepart;
};
