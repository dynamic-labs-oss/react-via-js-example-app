import type {
  BitcoinSignPsbtRequest,
  BitcoinWalletAccount,
} from '@dynamic-labs-sdk/bitcoin';
import { signPsbt, signPsbts } from '@dynamic-labs-sdk/bitcoin';
import { isWaasWalletAccount } from '@dynamic-labs-sdk/client/waas';
import { Psbt, networks } from 'bitcoinjs-lib';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

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
import { generatePsbtFromMessage } from '../../../../functions/generatePsbtFromMessage';

type SignPsbtDialogProps = {
  walletAccount: BitcoinWalletAccount;
};

export const SignPsbtDialog: FC<SignPsbtDialogProps> = ({ walletAccount }) => {
  const [isOpen, _setIsOpen] = useState(false);

  const [signatures, setSignatures] = useState<string[]>([]);

  const [finalizedPsbts, setFinalizedPsbts] = useState<string[]>([]);

  const [rawTxHexes, setRawTxHexes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | undefined>();
  const [numPsbts, setNumPsbts] = useState<number>(1);

  const isEmbeddedWallet = isWaasWalletAccount({ walletAccount });

  const setIsOpen = (open: boolean) => {
    _setIsOpen(open);

    if (!open) {
      setMessage('');
      setSignatures([]);
      setFinalizedPsbts([]);
      setRawTxHexes([]);
    }
  };

  const handleFinalizePsbts = () => {
    const finalized: string[] = [];
    const rawHexes: string[] = [];

    signatures.forEach((signedPsbtBase64) => {
      const psbt = Psbt.fromBase64(signedPsbtBase64, {
        network: networks.bitcoin,
      });

      psbt.finalizeAllInputs();

      finalized.push(psbt.toBase64());
      rawHexes.push(psbt.extractTransaction().toHex());
    });

    setFinalizedPsbts(finalized);
    setRawTxHexes(rawHexes);
  };

  const handleSignPsbt = async (e: FormEvent<HTMLFormElement>) => {
    setSignatures([]);
    setFinalizedPsbts([]);
    setRawTxHexes([]);
    e.preventDefault();

    try {
      setLoading(true);

      // For embedded wallets: use the input directly as PSBT base64
      // For external wallets: generate a dummy PSBT from message
      const unsignedPsbtBase64 = isEmbeddedWallet
        ? message || ''
        : generatePsbtFromMessage({
            message: message || '',
            walletAccount,
          });

      // Define the parameters for signing the PSBT
      const request: BitcoinSignPsbtRequest = {
        // Only allow SIGHASH_ALL
        allowedSighash: [1],
        signature: [
          {
            // The address that is signing
            address: walletAccount.address,
            // The index of the input being signed
            signingIndexes: [0],
          },
        ],
        // The unsigned PSBT in Base64 format
        unsignedPsbtBase64,
      };

      if (numPsbts === 1 || isEmbeddedWallet) {
        const result = await signPsbt({
          request,
          walletAccount,
        });
        setSignatures([result.signedPsbt]);
        return;
      }

      const requests = Array.from({ length: numPsbts }, () => request);
      const result = await signPsbts({
        requests,
        walletAccount,
      });
      setSignatures(result.signedPsbts);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Sign PSBTs
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="send-transaction-dialog"
      >
        <DialogTitle>Sign PSBTs</DialogTitle>
        <form onSubmit={handleSignPsbt} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="psbtInput">
              {isEmbeddedWallet ? 'Unsigned PSBT (Base64)' : 'Message'}
            </Label>

            {isEmbeddedWallet ? (
              <textarea
                name="psbtInput"
                placeholder="Paste unsigned PSBT in base64 format"
                className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[80px] resize-none font-mono w-full"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            ) : (
              <Input
                type="text"
                name="psbtInput"
                placeholder="Enter message to sign"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            )}
          </div>

          {!isEmbeddedWallet && (
            <div className="space-y-2">
              <Label>Number of PSBTs to sign</Label>

              <Select
                value={String(numPsbts)}
                onValueChange={(value) => setNumPsbts(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !message}
          >
            Sign
          </Button>

          {signatures.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Signed PSBTs
                </p>
                {signatures.map((signature, index) => (
                  <p
                    className="font-mono text-xs text-muted-foreground break-all"
                    key={index}
                  >
                    {signature}
                  </p>
                ))}
              </div>

              {isEmbeddedWallet && finalizedPsbts.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFinalizePsbts}
                >
                  Finalize PSBTs
                </Button>
              )}

              {finalizedPsbts.length > 0 && (
                <>
                  <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Finalized PSBTs (Base64)
                    </p>
                    {finalizedPsbts.map((finalized, index) => (
                      <p
                        className="font-mono text-xs text-muted-foreground break-all"
                        key={index}
                      >
                        {finalized}
                      </p>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Raw Transactions (Hex)
                    </p>
                    {rawTxHexes.map((hex, index) => (
                      <p
                        className="font-mono text-xs text-muted-foreground break-all"
                        key={index}
                      >
                        {hex}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
