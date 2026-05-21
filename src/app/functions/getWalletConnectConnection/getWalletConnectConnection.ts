import {
  connectAndVerifyWithWalletConnectEvm,
  connectWithWalletConnectEvm,
} from '@dynamic-labs-sdk/evm/wallet-connect';
import {
  connectAndVerifyWithWalletConnectSolana,
  connectWithWalletConnectSolana,
} from '@dynamic-labs-sdk/solana/wallet-connect';

type GetWalletConnectConnectionParams = {
  autoVerify: boolean;
  chain: 'EVM' | 'SOL';
};

/**
 * Starts a WalletConnect pairing session for the given chain and returns
 * the resulting connection (a `uri` to render in a QR code or open via
 * deep link, and an `approval` promise that resolves once the user
 * approves the session in their wallet).
 *
 * When `autoVerify` is true, the SDK also verifies wallet ownership as
 * part of the same flow.
 */
export const getWalletConnectConnection = ({
  autoVerify,
  chain,
}: GetWalletConnectConnectionParams) => {
  if (chain === 'EVM') {
    return autoVerify
      ? connectAndVerifyWithWalletConnectEvm()
      : connectWithWalletConnectEvm();
  }

  return autoVerify
    ? connectAndVerifyWithWalletConnectSolana()
    : connectWithWalletConnectSolana();
};
