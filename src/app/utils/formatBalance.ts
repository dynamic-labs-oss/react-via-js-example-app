export const formatBalance = (balance: number): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  if (balance < 1) return balance.toPrecision(4);
  if (balance >= 1_000_000) return `${(balance / 1_000_000).toFixed(2)}M`;
  if (balance >= 1_000)
    return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return balance.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

export const formatUsd = (value: number): string => {
  if (value < 0.01) return '<$0.01';
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};
