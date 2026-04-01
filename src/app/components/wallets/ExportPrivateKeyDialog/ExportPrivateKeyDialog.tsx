import type { WalletAccount } from '@dynamic-labs-sdk/client';
import { exportWaasPrivateKey } from '@dynamic-labs-sdk/client/waas';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ExportPrivateKeyDialogProps = {
  walletAccount: WalletAccount;
};

export const ExportPrivateKeyDialog: FC<ExportPrivateKeyDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportContainer, setExportContainer] = useState<HTMLElement | null>(
    null
  );

  const { isLoading } = useQuery<void, Error, void>({
    enabled: !!exportContainer && exportContainer.children.length === 0,
    queryFn: () =>
      exportWaasPrivateKey({
        displayContainer: exportContainer as HTMLElement,
        walletAccount,
      }),
    queryKey: ['exportPrivateKey', walletAccount.id],
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Export Private Key
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Export Private Key</DialogTitle>
        <div
          ref={setExportContainer}
          className="bg-muted/50 rounded-lg p-2 border border-border flex gap-2 items-center justify-center flex-col min-h-[120px]"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
