import ecc from '@bitcoinerlab/secp256k1';
import type { BitcoinWalletAccount } from '@dynamic-labs-sdk/bitcoin';
import { BIP322 } from 'bip322-js';
import {
  Transaction,
  address as bitcoinAddress,
  initEccLib,
  networks,
} from 'bitcoinjs-lib';

initEccLib(ecc);

type GeneratePsbtFromMessageParams = {
  message: string;
  walletAccount: BitcoinWalletAccount;
};

const getTapInternalKey = (walletAccount: BitcoinWalletAccount) => {
  const isTaprootAddress =
    walletAccount.address.startsWith('tb1p') ||
    walletAccount.address.startsWith('bc1p');

  const walletRequiresTapInternalKey =
    walletAccount.walletProviderKey.includes('xverse');

  if (!isTaprootAddress || !walletRequiresTapInternalKey) {
    return undefined;
  }

  const publicKey = walletAccount.addressesWithTypes?.find(
    ({ address }) => address === walletAccount.address
  )?.publicKey;

  if (!publicKey) {
    return undefined;
  }

  return Buffer.from(publicKey, 'hex');
};

export const generatePsbtFromMessage = ({
  walletAccount,
  message,
}: GeneratePsbtFromMessageParams) => {
  // Turn address into its scriptPubKey (output script)
  const scriptPubKey = bitcoinAddress.toOutputScript(
    walletAccount.address,
    networks.bitcoin
  );

  // Build the BIP-322 “toSpend” tx (encodes the message), then the PSBT (“toSign”)
  const toSpend = BIP322.buildToSpendTx(message, Buffer.from(scriptPubKey)); // bitcoin.Transaction

  const toSign = BIP322.buildToSignTx(
    toSpend.getId(),
    Buffer.from(scriptPubKey),
    undefined,
    getTapInternalKey(walletAccount)
  ); // bitcoin.Psbt

  toSign.updateInput(0, { sighashType: Transaction.SIGHASH_ALL });

  return toSign.toBase64();
};
