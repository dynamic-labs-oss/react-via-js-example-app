import type { SimulationResult } from '@dynamic-labs-sdk/client';

export type FeeDataWithBase = {
  humanReadableAmount: string;
  nativeAmount: bigint;
  usdAmount?: string;
};

export type EvmFeeData = FeeDataWithBase & {
  gasEstimate?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

export type ValidationBadgeProps = {
  validation: SimulationResult['validation'];
};

export type AssetDiffDisplayProps = {
  assets: SimulationResult['inAssets'];
  type: 'in' | 'out';
};

export type FeeDataDisplayProps = {
  feeData: SimulationResult['feeData'];
};
