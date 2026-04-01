import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import type { SolTransferArgs } from './solana.types';

export const createSolanaTransaction = async ({
  solanaWalletAccount,
  toAddress,
  amount,
  isVersioned,
  rpcUrl,
}: SolTransferArgs): Promise<VersionedTransaction | Transaction> => {
  const connection = new Connection(rpcUrl, 'confirmed');

  if (!connection) {
    throw new Error('Unable to retrieve Solana Connection');
  }

  let fromPublicKey: PublicKey;
  let toPublicKey: PublicKey;

  try {
    fromPublicKey = new PublicKey(solanaWalletAccount.address);
  } catch {
    throw new Error(`Invalid sender address: ${solanaWalletAccount.address}`);
  }

  try {
    toPublicKey = new PublicKey(toAddress);
  } catch {
    throw new Error(
      `Invalid recipient address: ${toAddress}. Please enter a valid Solana address (base58 encoded).`
    );
  }

  // Convert SOL amount to lamports
  const totalLamports = Math.floor(parseFloat(amount) * 1_000_000_000);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('finalized');

  // Create single transaction
  const instruction = SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    lamports: totalLamports,
    toPubkey: toPublicKey,
  });

  if (isVersioned) {
    const message = new TransactionMessage({
      instructions: [instruction],
      payerKey: fromPublicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message();

    return new VersionedTransaction(message);
  }

  const transaction = new Transaction().add(instruction);
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromPublicKey;
  return transaction;
};
