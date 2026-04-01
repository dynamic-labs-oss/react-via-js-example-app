import {
  createWaasWalletAccounts,
  getChainsMissingWaasWalletAccounts,
} from '@dynamic-labs-sdk/client/waas';

export const onSignIn = async () => {
  const missingChains = getChainsMissingWaasWalletAccounts();

  if (missingChains.length === 0) {
    return;
  }

  await createWaasWalletAccounts({ chains: missingChains });
};
