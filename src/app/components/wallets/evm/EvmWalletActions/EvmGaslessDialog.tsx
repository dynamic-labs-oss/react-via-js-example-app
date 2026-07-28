import type { EvmWalletAccount } from '@dynamic-labs-sdk/evm';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DelegationTab } from './DelegationTab';
import { SponsoredTransactionTab } from './SponsoredTransactionTab';

type EvmGaslessDialogProps = {
  walletAccount: EvmWalletAccount;
};

export const EvmGaslessDialog: FC<EvmGaslessDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('delegation');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          EVM Gasless
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto"
        aria-describedby="evm-gasless-dialog"
      >
        <DialogTitle>EVM Gasless (Sponsored Transactions)</DialogTitle>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="delegation">Delegation</TabsTrigger>
            <TabsTrigger value="sponsored-tx">Sponsored Tx</TabsTrigger>
          </TabsList>

          <TabsContent value="delegation">
            <DelegationTab walletAccount={walletAccount} />
          </TabsContent>

          <TabsContent value="sponsored-tx">
            <SponsoredTransactionTab walletAccount={walletAccount} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
