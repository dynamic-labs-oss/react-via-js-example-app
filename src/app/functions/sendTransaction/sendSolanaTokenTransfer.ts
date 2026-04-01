import type { NetworkData } from '@dynamic-labs-sdk/client';
import {
  type SolanaWalletAccount,
  signAndSendSponsoredTransaction,
  signAndSendTransaction,
} from '@dynamic-labs-sdk/solana';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

const deriveAssociatedTokenAddress = (
  mint: PublicKey,
  owner: PublicKey
): PublicKey => {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
};

const buildCreateAtaInstruction = (
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): TransactionInstruction =>
  new TransactionInstruction({
    data: Buffer.alloc(0),
    keys: [
      { isSigner: true, isWritable: true, pubkey: payer },
      { isSigner: false, isWritable: true, pubkey: associatedToken },
      { isSigner: false, isWritable: false, pubkey: owner },
      { isSigner: false, isWritable: false, pubkey: mint },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      { isSigner: false, isWritable: false, pubkey: TOKEN_PROGRAM_ID },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
  });

const buildTransferCheckedInstruction = (
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number
): TransactionInstruction => {
  // Layout: u8 instruction (12) | u64 amount (LE) | u8 decimals
  const data = new Uint8Array(10);
  const view = new DataView(data.buffer);
  view.setUint8(0, 12);
  view.setBigUint64(1, amount, true);
  view.setUint8(9, decimals);

  return new TransactionInstruction({
    data: Buffer.from(data),
    keys: [
      { isSigner: false, isWritable: true, pubkey: source },
      { isSigner: false, isWritable: false, pubkey: mint },
      { isSigner: false, isWritable: true, pubkey: destination },
      { isSigner: true, isWritable: false, pubkey: owner },
    ],
    programId: TOKEN_PROGRAM_ID,
  });
};

type SendSolanaTokenTransferParams = {
  activeNetworkData: NetworkData;
  amount: string;
  decimals: number;
  recipient: string;
  sponsored?: boolean;
  tokenMintAddress: string;
  walletAccount: SolanaWalletAccount;
};

export const sendSolanaTokenTransfer = async ({
  activeNetworkData,
  amount,
  decimals,
  recipient,
  sponsored = false,
  tokenMintAddress,
  walletAccount,
}: SendSolanaTokenTransferParams) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const rpcUrl = activeNetworkData.rpcUrls.http[0];
  const connection = new Connection(rpcUrl, 'confirmed');

  const fromPublicKey = new PublicKey(walletAccount.address);
  const toPublicKey = new PublicKey(recipient);
  const mintPublicKey = new PublicKey(tokenMintAddress);

  const senderTokenAccount = deriveAssociatedTokenAddress(
    mintPublicKey,
    fromPublicKey
  );

  const recipientTokenAccount = deriveAssociatedTokenAddress(
    mintPublicKey,
    toPublicKey
  );

  const recipientAccountInfo = await connection.getAccountInfo(
    recipientTokenAccount
  );

  // String-based conversion to avoid floating-point precision loss
  const [whole = '0', fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  const rawAmount = BigInt(whole + paddedFraction);

  const { blockhash } = await connection.getLatestBlockhash('finalized');

  const instructions = [];

  if (!recipientAccountInfo) {
    instructions.push(
      buildCreateAtaInstruction(
        fromPublicKey,
        recipientTokenAccount,
        toPublicKey,
        mintPublicKey
      )
    );
  }

  instructions.push(
    buildTransferCheckedInstruction(
      senderTokenAccount,
      mintPublicKey,
      recipientTokenAccount,
      fromPublicKey,
      rawAmount,
      decimals
    )
  );

  const message = new TransactionMessage({
    instructions,
    payerKey: fromPublicKey,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  const send = sponsored
    ? signAndSendSponsoredTransaction
    : signAndSendTransaction;

  const { signature } = await send({
    transaction,
    walletAccount,
  });

  return signature;
};
