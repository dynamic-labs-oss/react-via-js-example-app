import type { SolanaWalletAccount } from '@dynamic-labs-sdk/solana';

export type BaseTransactionArgs = {
  amount: string;
  toAddress: string;
};

export type SolTransferArgs = BaseTransactionArgs & {
  isSplit?: boolean;
  isVersioned: boolean;
  rpcUrl: string;
  solanaWalletAccount: SolanaWalletAccount;
};
