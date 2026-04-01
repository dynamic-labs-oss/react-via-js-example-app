import type { Chain } from '@dynamic-labs-sdk/client';

import type { SupportedChain } from '../../constants';

export type PresetToken = {
  address: string;
  decimals: number;
  displayName: string;
  logoURI: string;
  networkId: string;
  symbol: string;
};

const DESTINATION_TOKENS_BY_CHAIN: Partial<
  Record<SupportedChain, PresetToken[]>
> = {
  EVM: [
    // Ethereum mainnet
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      // eslint-disable-next-line custom-rules/ban-ethereum-eth-terms
      displayName: 'Ethereum - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '1',
      symbol: 'USDC',
    },
    // Polygon
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      displayName: 'Polygon - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '137',
      symbol: 'USDC',
    },
    // Base
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      displayName: 'Base - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '8453',
      symbol: 'USDC',
    },
    // Arbitrum
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      displayName: 'Arbitrum - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '42161',
      symbol: 'USDC',
    },
    // Avalanche
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      decimals: 6,
      displayName: 'Avalanche - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '43114',
      symbol: 'USDC',
    },
  ],
  SOL: [
    // Solana mainnet
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      displayName: 'Solana - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '101',
      symbol: 'USDC',
    },
  ],
  SUI: [
    // Sui mainnet
    {
      address:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      decimals: 6,
      displayName: 'Sui - USDC',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      networkId: '501',
      symbol: 'USDC',
    },
  ],
};

export const getTokenPresetsForChain = (chain: Chain): PresetToken[] => {
  const tokensForChain = DESTINATION_TOKENS_BY_CHAIN[chain as SupportedChain];

  return tokensForChain ?? [];
};
