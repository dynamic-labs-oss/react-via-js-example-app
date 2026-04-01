import type { NetworkData, WalletAccount } from '@dynamic-labs-sdk/client';
import { useAtomValue } from 'jotai';
import { Provider } from 'jotai/react';
import { useHydrateAtoms } from 'jotai/utils';
import { ArrowDownUp } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuoteForm } from '../QuoteForm';
import { ReviewStep } from '../ReviewStep';
import { StatusStep } from '../StatusStep';
import {
  activeNetworkDataAtom,
  destinationAtom,
  quoteAtom,
  sourceTokenAtom,
  stepAtom,
  walletAccountAtom,
} from '../swap.atoms';

type SwapTokenDialogProps = {
  activeNetworkData: NetworkData;
  walletAccount: WalletAccount;
};

/**
 * Hydrates the session context atoms from props and renders the current swap step.
 * Lives inside a scoped Jotai Provider so atoms reset automatically on unmount.
 */
const SwapTokenDialogInner: FC<SwapTokenDialogProps> = ({ walletAccount, activeNetworkData }) => {
  // Synchronously populate context and form-default atoms before any child renders.
  useHydrateAtoms([
    [walletAccountAtom, walletAccount],
    [activeNetworkDataAtom, activeNetworkData],
    [sourceTokenAtom, { decimals: activeNetworkData.nativeCurrency.decimals, tokenAddress: '' }],
    [destinationAtom, { networkId: activeNetworkData.networkId, tokenAddress: '' }],
  ]);

  const step = useAtomValue(stepAtom);
  const quote = useAtomValue(quoteAtom);

  return (
    <>
      {step === 'quote' && <QuoteForm />}
      {step === 'review' && quote && <ReviewStep />}
      {step === 'status' && quote && <StatusStep />}
    </>
  );
};

/**
 * Swap Token dialog entry point. Wraps content in a scoped Jotai Provider
 * so all swap atoms are isolated to this dialog instance and reset on close.
 */
export const SwapTokenDialog: FC<SwapTokenDialogProps> = ({
  walletAccount,
  activeNetworkData,
}) => {
  if (activeNetworkData.testnet) {
    return (
      <span title="Swapping is not supported on testnets">
        <Button variant="ghost" size="sm" disabled>
          <ArrowDownUp className="w-3 h-3" />
          Swap Token
        </Button>
      </span>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <ArrowDownUp className="w-3 h-3" />
          Swap Token
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[460px]"
        aria-describedby="swap-token-dialog"
      >
        <DialogTitle>Swap Token</DialogTitle>
        {/* Scoped Provider: atoms are created fresh on open and discarded on close */}
        <Provider>
          <SwapTokenDialogInner
            walletAccount={walletAccount}
            activeNetworkData={activeNetworkData}
          />
        </Provider>
      </DialogContent>
    </Dialog>
  );
};
