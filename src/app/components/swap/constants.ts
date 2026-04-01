import type { Chain } from '@dynamic-labs-sdk/client';

export const SUPPORTED_CHAINS = ['EVM', 'SOL', 'SUI'] satisfies Chain[];
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

export const OTHER_TOKEN_VALUE = '__other__';
export const NATIVE_TOKEN_VALUE = '__native__';

export const SLIPPAGE_OPTIONS = ['0.5', '1', '3'];
