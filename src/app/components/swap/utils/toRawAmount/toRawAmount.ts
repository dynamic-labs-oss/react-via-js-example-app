export const toRawAmount = (humanAmount: string, decimals: number): string => {
  const num = Number(humanAmount);
  if (Number.isNaN(num) || num === 0) return '0';

  const [whole = '0', fraction = ''] = humanAmount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  const isNegative = whole.startsWith('-');
  const absWhole = isNegative ? whole.slice(1) : whole;
  const raw = `${absWhole}${paddedFraction}`.replace(/^0+/, '') || '0';
  return isNegative && raw !== '0' ? `-${raw}` : raw;
};
