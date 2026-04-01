import type { Chain } from '@dynamic-labs-sdk/client';
import type { Iconic } from '@dynamic-labs/iconic';
import {
  AlgorandIcon,
  AptosIcon,
  BitcoinIcon,
  CosmosIcon,
  EthereumIcon,
  FlowIcon,
  SolanaIcon,
  SparkIcon,
  StarknetIcon,
  SuiIcon,
  TonIcon,
  TronIcon,
} from '@dynamic-labs/iconic';

const chainIconMap: Record<Chain, Iconic> = {
  ALGO: AlgorandIcon,
  APTOS: AptosIcon,
  BTC: BitcoinIcon,
  COSMOS: CosmosIcon,
  EVM: EthereumIcon,
  FLOW: FlowIcon,
  SOL: SolanaIcon,
  SPARK: SparkIcon,
  STARK: StarknetIcon,
  SUI: SuiIcon,
  TON: TonIcon,
  TRON: TronIcon,
};

export const getChainIcon = (chain: Chain) => {
  return chainIconMap[chain];
};
