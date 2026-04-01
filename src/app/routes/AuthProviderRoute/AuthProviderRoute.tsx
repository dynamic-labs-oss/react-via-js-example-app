import type { WalletAccount, WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  verifyWalletAccount,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { type FC, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { promptCaptchaIfRequired } from '../../../store/captcha';
import { AutoVerifyWalletsSwitch } from '../../components/AutoVerifyWalletsSwitch';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { ModalLayout } from '../../components/ModalLayout/ModalLayout';
import { WalletNeedsVerifyView } from '../../components/WalletNeedsVerifyView/WalletNeedsVerifyView';
import { WalletProviderButton } from '../../components/wallets/WalletProviderButton';
import { connectWalletWithAutoVerify } from '../../functions/connectWalletWithAutoVerify/connectWalletWithAutoVerify';
import { getChainIcon } from '../../functions/getChainIcon';
import { onSignIn } from '../../functions/onSignIn/onSignIn';
import { useUser } from '../../hooks/useUser';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';
import { useWalletProviders } from '../../hooks/useWalletProviders';

export const AuthProviderRoute: FC = () => {
  const { walletProviderKey } = useParams<{ walletProviderKey: string }>();
  const user = useUser();
  const walletProviders = useWalletProviders();
  const [selectedWalletProvider, setSelectedWalletProvider] =
    useState<WalletProviderData>();
  const walletAccounts = useWalletAccounts();

  const [needsVerifyState, setNeedsVerifyState] = useState<{
    walletAccount: WalletAccount;
    walletProvider: WalletProviderData;
  } | null>(null);
  const [verifyError, setVerifyError] = useState<unknown>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredWalletProviders = useMemo(() => {
    if (!walletProviderKey) return [];
    return walletProviders.filter(
      (provider) => provider.groupKey === walletProviderKey
    );
  }, [walletProviders, walletProviderKey]);

  const { mutate: walletSignIn, error } = useMutation({
    mutationFn: async (walletProvider: WalletProviderData) => {
      await promptCaptchaIfRequired();

      const result = await connectWalletWithAutoVerify({
        walletProvider,
      });

      if (result.status === 'needs-verify') {
        setNeedsVerifyState({
          walletAccount: result.walletAccount,
          walletProvider: result.walletProvider,
        });
        return;
      }

      await onSignIn();
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    },
    onMutate: (walletProvider) => {
      setSelectedWalletProvider(walletProvider);
    },
    onSettled: () => {
      setSelectedWalletProvider(undefined);
    },
  });

  const handleVerify = async () => {
    if (!needsVerifyState) return;

    try {
      setIsVerifying(true);
      setVerifyError(null);

      await verifyWalletAccount({ walletAccount: needsVerifyState.walletAccount });
      await onSignIn();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setVerifyError(err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  if (walletAccounts.length > 0) {
    return <Navigate to="/wallets" />;
  }

  if (!walletProviderKey) {
    return <Navigate to="/auth" />;
  }

  if (filteredWalletProviders.length === 0) {
    return (
      <ModalLayout title="Provider Not Found">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-sm text-muted-foreground">
            No wallet providers found for &ldquo;{walletProviderKey}&rdquo;
          </p>
          <Link
            to="/auth"
            className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </ModalLayout>
    );
  }

  if (needsVerifyState) {
    return (
      <ModalLayout title="Sign in to your account">
        <WalletNeedsVerifyView
          error={verifyError}
          isVerifying={isVerifying}
          onVerify={handleVerify}
          walletAccount={needsVerifyState.walletAccount}
          walletProvider={needsVerifyState.walletProvider}
        />
      </ModalLayout>
    );
  }

  if (selectedWalletProvider) {
    return (
      <ModalLayout title="Sign in to your account">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
            <img
              alt={selectedWalletProvider.metadata.displayName}
              src={selectedWalletProvider.metadata.icon}
              className="w-10 h-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Connecting to {selectedWalletProvider.metadata.displayName}…
          </p>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout title="Sign in to your account">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <img
            src={filteredWalletProviders[0]?.metadata.icon}
            alt={filteredWalletProviders[0]?.metadata.displayName}
            className="w-6 h-6"
          />
          <h2 className="text-lg font-semibold text-foreground">
            {filteredWalletProviders[0]?.metadata.displayName}
          </h2>
          {filteredWalletProviders.length > 1 && (
            <span className="text-xs text-muted-foreground">
              ({filteredWalletProviders.length})
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Choose your preferred chain to connect
        </p>
      </div>

      <AutoVerifyWalletsSwitch />

      <div className="flex flex-col gap-2">
        {filteredWalletProviders.map((walletProvider) => (
          <WalletProviderButton
            key={walletProvider.key}
            groupKey={walletProvider.groupKey}
            IconComponent={getChainIcon(walletProvider.chain)}
            displayName={walletProvider.chain}
            onClick={() => walletSignIn(walletProvider)}
            chain={walletProvider.chain}
          />
        ))}
      </div>

      <ErrorMessage error={error} />

      <div className="flex justify-center">
        <Link
          to="/auth"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
        >
          Back
        </Link>
      </div>
    </ModalLayout>
  );
};
