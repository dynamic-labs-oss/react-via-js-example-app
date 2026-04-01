import { Info } from 'lucide-react';
import type { FC } from 'react';

import type {
  EvmFeeData,
  FeeDataDisplayProps,
  FeeDataWithBase,
} from '../SimulateTransactionDialog.types';

export const FeeDataDisplay: FC<FeeDataDisplayProps> = ({ feeData }) => {
  if (!feeData) return null;

  // Type guard to check if feeData has EVM-specific properties
  const hasEvmProperties = (data: unknown): data is EvmFeeData => {
    return (
      typeof data === 'object' &&
      data !== null &&
      ('gasEstimate' in data || 'gasPrice' in data || 'maxFeePerGas' in data)
    );
  };

  // Type guard for base fee data
  const isBaseFeeData = (data: unknown): data is FeeDataWithBase => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'humanReadableAmount' in data &&
      'nativeAmount' in data
    );
  };

  if (!isBaseFeeData(feeData)) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Estimated Fees</p>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Native Amount:</span>
          <span className="font-mono">
            {feeData.humanReadableAmount || '0'}
          </span>
        </div>
        {feeData.usdAmount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">USD Value:</span>
            <span className="font-mono">${feeData.usdAmount}</span>
          </div>
        )}
        {hasEvmProperties(feeData) && Boolean(feeData.gasEstimate) && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gas Estimate:</span>
            <span className="font-mono">{feeData.gasEstimate?.toString()}</span>
          </div>
        )}
        {hasEvmProperties(feeData) && Boolean(feeData.gasPrice) && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gas Price:</span>
            <span className="font-mono">{feeData.gasPrice?.toString()}</span>
          </div>
        )}
        {hasEvmProperties(feeData) && Boolean(feeData.maxFeePerGas) && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Fee Per Gas:</span>
            <span className="font-mono">
              {feeData.maxFeePerGas?.toString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
