import type {
  BitcoinAddressType,
  BitcoinSignProtocol,
} from '@dynamic-labs-sdk/bitcoin';
import {
  isBitcoinWalletAccount,
  signMessageWithCustomOptions,
} from '@dynamic-labs-sdk/bitcoin';
import type { WalletAccount } from '@dynamic-labs-sdk/client';
import { signMessage } from '@dynamic-labs-sdk/client';
import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import { useMutation } from '@tanstack/react-query';
import type { FC, FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '../../ErrorMessage';

type SignMessageDialogProps = {
  walletAccount: WalletAccount;
};

const formatAddressType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const SignMessageDialog: FC<SignMessageDialogProps> = ({
  walletAccount,
}) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [message, _setMessage] = useState<string>('');
  const [signature, setSignature] = useState<string>();

  const [addressType, _setAddressType] = useState<BitcoinAddressType>();
  const [protocol, _setProtocol] = useState<BitcoinSignProtocol>();

  const availableAddressTypes = useMemo(() => {
    if (!isBitcoinWalletAccount(walletAccount)) {
      return [];
    }

    return walletAccount.addressesWithTypes ?? [];
  }, [walletAccount]);

  const isEmbeddedBtcWallet =
    isBitcoinWalletAccount(walletAccount) &&
    isWaasWalletAccount({ walletAccount });

  const {
    error,
    mutate: handleSignMessage,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setSignature(undefined);
      if (isBitcoinWalletAccount(walletAccount) && (addressType || protocol)) {
        const { signature } = await signMessageWithCustomOptions({
          addressType,
          message,
          protocol,
          walletAccount,
        });
        setSignature(signature);
        return;
      }

      const { signature } = await signMessage({ message, walletAccount });
      setSignature(signature);
    },
  });

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);
    if (!open) {
      _setMessage('');
      _setAddressType(undefined);
      _setProtocol(undefined);
      setSignature(undefined);
      reset();
    }
  };

  const setMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(undefined);

    const message = e.target.value;

    _setMessage(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Sign Message
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Sign Message</DialogTitle>
        <form
          onSubmit={(e) => handleSignMessage(e)}
          className="flex flex-col space-y-4"
        >
          {isBitcoinWalletAccount(walletAccount) && (
            <>
              {availableAddressTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Address Type</Label>

                  <Select
                    value={addressType || 'default'}
                    onValueChange={(value) => {
                      setSignature(undefined);
                      _setAddressType(
                        value === 'default'
                          ? undefined
                          : (value as BitcoinAddressType)
                      );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {availableAddressTypes.map((addressWithType) => (
                        <SelectItem
                          key={addressWithType.type}
                          value={addressWithType.type}
                        >
                          {formatAddressType(addressWithType.type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Protocol</Label>

                <Select
                  value={protocol || (isEmbeddedBtcWallet ? 'bip322-simple' : 'default')}
                  onValueChange={(value) => {
                    setSignature(undefined);
                    _setProtocol(
                      value === 'default'
                        ? undefined
                        : (value as BitcoinSignProtocol)
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isEmbeddedBtcWallet ? (
                      <SelectItem value="bip322-simple">
                        BIP322 Simple
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="ecdsa">ECDSA</SelectItem>
                        <SelectItem value="bip322-simple">
                          BIP322 Simple
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              type="text"
              name="message"
              placeholder="Message to sign"
              required
              value={message}
              onChange={setMessage}
            />
          </div>
          <Button
            type="submit"
            loading={isPending}
            disabled={!message || isPending}
          >
            {isPending ? 'Signing...' : 'Sign'}
          </Button>

          <ErrorMessage
            error={error}
            defaultMessage="Failed to sign message"
            className="text-left"
          />

          {signature && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Signature
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {signature}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
