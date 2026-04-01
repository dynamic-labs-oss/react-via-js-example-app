import { ArrowDown, ArrowUp } from 'lucide-react';
import type { FC } from 'react';

import type { AssetDiffDisplayProps } from '../SimulateTransactionDialog.types';

export const AssetDiffDisplay: FC<AssetDiffDisplayProps> = ({
  assets,
  type,
}) => {
  if (assets.length === 0) return null;

  const Icon = type === 'in' ? ArrowDown : ArrowUp;
  const colorClass = type === 'in' ? 'text-emerald-600' : 'text-red-600';
  const bgClass = type === 'in' ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const borderClass =
    type === 'in' ? 'border-emerald-500/30' : 'border-red-500/30';

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <p className={`text-sm font-semibold ${colorClass}`}>
          {type === 'in' ? 'Incoming' : 'Outgoing'} Assets
        </p>
      </div>
      <div className="space-y-2">
        {assets.map((assetDiff, idx) => {
          const { asset, transferIn, transferOut } = assetDiff;
          const transfers = type === 'in' ? transferIn : transferOut;
          const totalValue =
            transfers.reduce((sum, transfer) => {
              const value = parseFloat(transfer.value || '0');
              return sum + value;
            }, 0) || 0;
          const totalUsdPrice = transfers.reduce((sum, transfer) => {
            const price = parseFloat(transfer.usdPrice || '0');
            return sum + price;
          }, 0);

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs bg-white/50 rounded px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                {asset.logoUrl && (
                  <img
                    src={asset.logoUrl}
                    alt={asset.symbol || 'Asset'}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span className="font-medium">
                  {asset.symbol || asset.name || 'Unknown'}
                </span>
              </div>
              <div className="text-right">
                <p className="font-mono">{totalValue.toString()}</p>
                {totalUsdPrice > 0 && (
                  <p className="text-muted-foreground">
                    ${totalUsdPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
