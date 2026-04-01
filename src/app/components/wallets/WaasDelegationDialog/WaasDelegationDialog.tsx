import type { WalletAccount } from '@dynamic-labs-sdk/client';
import {
  delegateWaasKeyShares,
  hasDelegatedAccess,
  revokeWaasDelegation,
} from '@dynamic-labs-sdk/client/waas';
import { useQuery } from '@tanstack/react-query';
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

type WaasDelegationDialogProps = {
  walletAccount: WalletAccount;
};

export const WaasDelegationDialog: FC<WaasDelegationDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: isDelegated = false, refetch } = useQuery({
    queryFn: () => hasDelegatedAccess({ walletAccount }),
    queryKey: ['isDelegated', walletAccount.id],
  });

  const handleDelegateAccessApproval = useCallback(async () => {
    await delegateWaasKeyShares({ walletAccount });
    toast.success('Delegation approved', {
      description: 'You can now revoke this permission at any time.',
    });
    setIsOpen(false);
    void refetch();
  }, [walletAccount, refetch]);

  const handleDelegationRevocation = useCallback(async () => {
    await revokeWaasDelegation({ walletAccount });
    toast.success('Delegation revoked');
    setIsOpen(false);
    void refetch();
  }, [walletAccount, refetch]);

  if (!isDelegated) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Delegate Access
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Wallet delegation approval</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3">
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  The application is requesting access to perform automations on
                  your behalf.
                </p>
                <p>You can revoke this permission at any time.</p>
                <p>
                  Delegating your wallet lets this app act on your behalf, even
                  when you're not here. This is useful for things like trading
                  bots or other automated workflows. You stay in control — you
                  can revoke access anytime in your wallet settings.
                </p>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => handleDelegateAccessApproval()}
            >
              Approve
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Revoke Delegation
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Revoke Delegation</DialogTitle>
        <DialogDescription>
          Are you sure you want to revoke the delegation of access?
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDelegationRevocation()}
          >
            Confirm
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
