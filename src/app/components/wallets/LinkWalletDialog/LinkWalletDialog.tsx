import type { WalletAccount, WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  WalletAlreadyLinkedToAnotherUserError,
  getConnectedAddresses,
  isMobile,
  verifyWalletAccount,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { type FC, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { isLedgerMode } from '../../../../store/ledgerMode';
import { useWalletAccounts } from '../../../hooks/useWalletAccounts';
import { ErrorMessage } from '../../ErrorMessage';
import { WalletNeedsVerifyView } from '../../WalletNeedsVerifyView/WalletNeedsVerifyView';
import { WalletConnectQrCode } from '../../walletConnect/WalletConnectQrCode';
import { WalletConnectWalletList } from '../../walletConnect/WalletConnectWalletList';
import { LinkingWalletView } from './LinkingWalletView';
import { SelectLinkMethodView } from './SelectLinkMethodView';
import { SwitchWalletView } from './SwitchWalletView';
import { WalletAlreadyLinkedView } from './WalletAlreadyLinkedView';
import { connectWalletWithAutoVerify } from '../../../functions/connectWalletWithAutoVerify/connectWalletWithAutoVerify';

type LinkWalletViewState =
  | {
      type: 'linking-wallet';
      walletProvider: WalletProviderData;
    }
  | {
      type: 'linking-wallet-connect';
    }
  | {
      type: 'linking-wallet-to-current-user';
      walletProvider: WalletProviderData;
    }
  | {
      type: 'linked-wallet-needs-verify';
      walletAccount: WalletAccount;
      walletProvider: WalletProviderData;
    }
  | {
      type: 'select-wallet-provider';
    }
  | {
      type: 'switch-wallet';
      walletProvider: WalletProviderData;
    };

export const LinkWalletDialog: FC = () => {
  const walletAccounts = useWalletAccounts();
  const [isOpen, _setIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [viewState, setViewState] = useState<LinkWalletViewState>({
    type: 'select-wallet-provider',
  });
  const [verifyError, setVerifyError] = useState<unknown>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const setIsOpen = (isOpen: boolean) => {
    reset();

    _setIsOpen(isOpen);

    if (isOpen) {
      setViewState({
        type: 'select-wallet-provider',
      });
    }
  };

  const {
    error,
    mutate: handleOnSelectWalletProvider,
    reset,
  } = useMutation({
    mutationFn: async (walletProvider: WalletProviderData) => {
      const {
        addresses: [address],
      } = await getConnectedAddresses({
        walletProviderKey: walletProvider.key,
      });

      const isSelectedAddressAlreadyLinked = walletAccounts.some(
        (walletAccount) => walletAccount.address === address
      );

      if (isSelectedAddressAlreadyLinked) {
        setViewState({
          type: 'switch-wallet',
          walletProvider,
        });
        return;
      }

      await promptConnection(walletProvider);
    },
  });

  const promptConnection = async (walletProvider: WalletProviderData) => {
    setViewState({
      type: 'linking-wallet',
      walletProvider,
    });

    try {
      const hardwareWalletVendor = isLedgerMode()
        ? ('ledger' as const)
        : undefined;

      const result = await connectWalletWithAutoVerify({
        hardwareWalletVendor,
        walletProvider,
      });

      if (result.status === 'needs-verify') {
        setViewState({
          type: 'linked-wallet-needs-verify',
          walletAccount: result.walletAccount,
          walletProvider: result.walletProvider,
        });
        return;
      }

      setIsOpen(false);
    } catch (error) {
      if (error instanceof WalletAlreadyLinkedToAnotherUserError) {
        reset();

        setViewState({
          type: 'linking-wallet-to-current-user',
          walletProvider,
        });

        return;
      }

      throw error;
    }
  };

  const handleVerify = async () => {
    if (viewState.type !== 'linked-wallet-needs-verify') return;

    try {
      setIsVerifying(true);
      setVerifyError(null);

      await verifyWalletAccount({ walletAccount: viewState.walletAccount });
      setIsOpen(false);
    } catch (err) {
      setVerifyError(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOnSelectWalletConnect = () => {
    setViewState({
      type: 'linking-wallet-connect',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Link Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] flex flex-col gap-5">
        {viewState.type === 'select-wallet-provider' && (
          <SelectLinkMethodView
            onSelect={handleOnSelectWalletProvider}
            onSelectWalletConnect={handleOnSelectWalletConnect}
          />
        )}

        {viewState.type === 'linking-wallet' && (
          <LinkingWalletView walletProvider={viewState.walletProvider} />
        )}

        {viewState.type === 'switch-wallet' && (
          <SwitchWalletView walletProvider={viewState.walletProvider} />
        )}

        {viewState.type === 'linking-wallet-connect' &&
          (isMobile() ? (
            <WalletConnectWalletList
              onConnectionComplete={() => setIsOpen(false)}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
            />
          ) : (
            <WalletConnectQrCode
              onConnectionComplete={() => setIsOpen(false)}
            />
          ))}

        {viewState.type === 'linking-wallet-to-current-user' && (
          <WalletAlreadyLinkedView
            onCancel={() => setIsOpen(false)}
            onSuccess={() => setIsOpen(false)}
            walletProvider={viewState.walletProvider}
          />
        )}

        {viewState.type === 'linked-wallet-needs-verify' && (
          <WalletNeedsVerifyView
            error={verifyError}
            isVerifying={isVerifying}
            onVerify={handleVerify}
            walletAccount={viewState.walletAccount}
            walletProvider={viewState.walletProvider}
          />
        )}

        <ErrorMessage error={error} />
      </DialogContent>
    </Dialog>
  );
};
