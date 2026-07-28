import type {
  EvmWalletAccount,
  SponsoredTransactionCall,
} from '@dynamic-labs-sdk/evm';
import {
  sendSponsoredTransaction,
  signSponsoredTransaction,
} from '@dynamic-labs-sdk/evm';
import { useMutation } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { Hex } from 'viem';
import { encodeFunctionData, parseEther } from 'viem';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ErrorMessage } from '../../../ErrorMessage';

const MAX_CALLS = 5;

const INVALIDATE_NONCE_ABI = [
  {
    inputs: [{ name: 'nonce', type: 'uint256' }],
    name: 'invalidateNonce',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type SendNativeCall = {
  amount: string;
  target: string;
  type: 'sendNative';
};

type SendTokenCall = {
  amount: string;
  target: string;
  tokenAddress: string;
  type: 'sendToken';
};

type InvalidateNonceCall = {
  nonce: bigint;
  type: 'invalidateNonce';
};

type TypedCall = SendNativeCall | SendTokenCall | InvalidateNonceCall;

const generateRandomNonce = (): bigint => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes.reduce(
    (acc, byte) => (acc << 8n) | BigInt(byte),
    0n
  );
};

type BuildSponsoredCallParams = {
  entry: TypedCall;
  walletAddress: string;
};

const buildSponsoredCall = ({
  entry,
  walletAddress,
}: BuildSponsoredCallParams): SponsoredTransactionCall => {
  switch (entry.type) {
    case 'sendNative':
      return {
        data: '0x' as Hex,
        target: entry.target as Hex,
        value: parseEther(entry.amount || '0'),
      };
    case 'sendToken':
      return {
        data: encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          args: [entry.target as Hex, BigInt(entry.amount || '0')],
          functionName: 'transfer',
        }),
        target: entry.tokenAddress as Hex,
        value: 0n,
      };
    case 'invalidateNonce':
      return {
        data: encodeFunctionData({
          abi: INVALIDATE_NONCE_ABI,
          args: [entry.nonce],
          functionName: 'invalidateNonce',
        }),
        target: walletAddress as Hex,
        value: 0n,
      };
  }
};

type SponsoredTransactionTabProps = {
  walletAccount: EvmWalletAccount;
};

export const SponsoredTransactionTab: FC<SponsoredTransactionTabProps> = ({
  walletAccount,
}) => {
  const [calls, setCalls] = useState<TypedCall[]>([]);
  const [mode, setMode] = useState<'send' | 'signOnly'>('send');
  const [autoDelegate, setAutoDelegate] = useState(true);

  const addCall = (call: TypedCall) => {
    if (calls.length < MAX_CALLS) {
      setCalls([...calls, call]);
    }
  };

  const removeCall = ({ index }: { index: number }) => {
    setCalls(calls.filter((_, i) => i !== index));
  };

  const updateCall = ({
    index,
    updates,
  }: {
    index: number;
    updates: Partial<TypedCall>;
  }) => {
    setCalls(
      calls.map((call, i) =>
        i === index ? ({ ...call, ...updates } as TypedCall) : call
      )
    );
  };

  const {
    data: result,
    error,
    mutate: handleSubmit,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const sponsoredCalls = calls.map((call) =>
        buildSponsoredCall({
          entry: call,
          walletAddress: walletAccount.address,
        })
      );

      if (mode === 'send') {
        const { transactionHash } = await sendSponsoredTransaction({
          autoDelegate,
          calls: sponsoredCalls,
          walletAccount,
        });
        return { transactionHash, type: 'send' as const };
      }

      const signedTransaction = await signSponsoredTransaction({
        autoDelegate,
        calls: sponsoredCalls,
        walletAccount,
      });
      return { signedTransaction, type: 'signOnly' as const };
    },
  });

  const canAddCalls = calls.length < MAX_CALLS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Add Call Buttons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Calls ({calls.length}/{MAX_CALLS})
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={!canAddCalls}
            onClick={() =>
              addCall({ amount: '', target: '', type: 'sendNative' })
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Send Native
          </button>
          <button
            type="button"
            disabled={!canAddCalls}
            onClick={() =>
              addCall({
                amount: '',
                target: '',
                tokenAddress: '',
                type: 'sendToken',
              })
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Send Token
          </button>
          <button
            type="button"
            disabled={!canAddCalls}
            onClick={() =>
              addCall({ nonce: generateRandomNonce(), type: 'invalidateNonce' })
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Invalidate Nonce
          </button>
        </div>
      </div>

      {/* Call Entries */}
      {calls.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/50 px-3 py-4 text-center text-xs text-muted-foreground">
          No calls added. Add calls above or submit with an empty batch.
        </div>
      )}

      <div className="space-y-2">
        {calls.map((call, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {call.type === 'sendNative' && 'Send Native'}
                {call.type === 'sendToken' && 'Send Token (ERC-20)'}
                {call.type === 'invalidateNonce' && 'Invalidate Nonce'}
              </span>
              <button
                type="button"
                onClick={() => removeCall({ index })}
                className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {call.type === 'sendNative' && (
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Target address (0x...)"
                  value={call.target}
                  onChange={(e) => {
                    reset();
                    updateCall({ index, updates: { target: e.target.value } });
                  }}
                  className="h-8 text-xs"
                />
                <Input
                  type="text"
                  placeholder="Amount (e.g. 0.001)"
                  value={call.amount}
                  onChange={(e) => {
                    reset();
                    updateCall({ index, updates: { amount: e.target.value } });
                  }}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {call.type === 'sendToken' && (
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Token contract address (0x...)"
                  value={call.tokenAddress}
                  onChange={(e) => {
                    reset();
                    updateCall({
                      index,
                      updates: { tokenAddress: e.target.value },
                    });
                  }}
                  className="h-8 text-xs"
                />
                <Input
                  type="text"
                  placeholder="Recipient address (0x...)"
                  value={call.target}
                  onChange={(e) => {
                    reset();
                    updateCall({ index, updates: { target: e.target.value } });
                  }}
                  className="h-8 text-xs"
                />
                <Input
                  type="text"
                  placeholder="Amount (smallest unit)"
                  value={call.amount}
                  onChange={(e) => {
                    reset();
                    updateCall({ index, updates: { amount: e.target.value } });
                  }}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {call.type === 'invalidateNonce' && (
              <p className="font-mono text-[10px] text-muted-foreground break-all">
                Nonce: 0x{call.nonce.toString(16).slice(0, 16)}...
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-delegate" className="text-xs">
            Auto-delegate (7702)
          </Label>
          <Switch
            id="auto-delegate"
            checked={autoDelegate}
            onCheckedChange={setAutoDelegate}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="send-mode" className="text-xs">
            {mode === 'send' ? 'Send' : 'Sign Only'}
          </Label>
          <Switch
            id="send-mode"
            checked={mode === 'send'}
            onCheckedChange={(checked) =>
              setMode(checked ? 'send' : 'signOnly')
            }
          />
        </div>
      </div>

      <Button type="submit" loading={isPending} disabled={isPending}>
        {mode === 'send' ? 'Send' : 'Sign Only'}
      </Button>

      <ErrorMessage
        error={error}
        defaultMessage="Sponsored transaction failed"
        className="text-left"
      />

      {result?.type === 'send' && (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Transaction Hash
          </p>
          <p className="font-mono text-xs text-muted-foreground break-all">
            {result.transactionHash}
          </p>
        </div>
      )}

      {result?.type === 'signOnly' && (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Signed Transaction
          </p>
          <pre className="font-mono text-[10px] text-muted-foreground break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
            {JSON.stringify(
              result.signedTransaction,
              (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              2
            )}
          </pre>
        </div>
      )}
    </form>
  );
};
