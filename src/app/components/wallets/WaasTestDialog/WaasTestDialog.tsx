import type { WalletAccount } from '@dynamic-labs-sdk/client';
import {
  type WalletRecoveryState,
  getWalletRecoveryState,
  setWaasWalletAccountPassword,
  unlockWallet,
} from '@dynamic-labs-sdk/client/waas';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type WaasTestDialogProps = {
  walletAccount: WalletAccount;
};

export const WaasTestDialog: FC<WaasTestDialogProps> = ({ walletAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [recoveryState, setRecoveryState] =
    useState<WalletRecoveryState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPassword = useCallback(async () => {
    if (!password) {
      toast.error('Password required');
      return;
    }

    setIsLoading(true);

    try {
      await setWaasWalletAccountPassword({ password, walletAccount });
      toast.success('Password set successfully');
      setPassword('');
    } catch (error) {
      toast.error('Failed to set password', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [password, walletAccount]);

  const handleUnlockWallet = useCallback(async () => {
    if (!password) {
      toast.error('Password required');
      return;
    }

    setIsLoading(true);

    try {
      await unlockWallet({ password, walletAccount });
      toast.success('Wallet unlocked successfully');
      setPassword('');
    } catch (error) {
      toast.error('Failed to unlock wallet', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [password, walletAccount]);

  const handleGetRecoveryState = useCallback(async () => {
    setIsLoading(true);

    try {
      const state = await getWalletRecoveryState({ walletAccount });
      setRecoveryState(state);
      toast.success('Recovery state retrieved');
    } catch (error) {
      toast.error('Failed to get recovery state', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletAccount]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Password & Recovery
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Password & Recovery</DialogTitle>

        <DialogDescription className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Password</h3>
            <p className="text-sm">
              Enter a password to test setWaasWalletAccountPassword and
              unlockWallet.
            </p>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Set Password</h3>
            <p className="text-sm">
              Test the setWaasWalletAccountPassword method for wallets without
              a password.
            </p>

            <Button
              variant="default"
              onClick={() => handleSetPassword()}
              disabled={isLoading || !password}
              className="w-full"
            >
              Set Password
            </Button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Unlock Wallet</h3>
            <p className="text-sm">
              Test the unlockWallet method with a password.
            </p>

            <Button
              variant="default"
              onClick={() => handleUnlockWallet()}
              disabled={isLoading || !password}
              className="w-full"
            >
              Unlock Wallet
            </Button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Get Wallet Recovery State</h3>
            <p className="text-sm">
              Test the getWalletRecoveryState method to check wallet recovery
              status.
            </p>

            <Button
              variant="default"
              onClick={() => handleGetRecoveryState()}
              disabled={isLoading}
              className="w-full"
            >
              Get Recovery State
            </Button>

            {recoveryState && (
              <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 overflow-auto max-h-40">
                <pre className="font-mono text-xs text-muted-foreground">{JSON.stringify(recoveryState, null, 2)}</pre>
              </div>
            )}
          </div>
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
