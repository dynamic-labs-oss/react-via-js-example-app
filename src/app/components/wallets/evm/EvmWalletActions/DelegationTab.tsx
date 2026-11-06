import type { EvmWalletAccount } from '@dynamic-labs-sdk/evm';
import {
  activate7702Delegation,
  is7702DelegationActive,
  sign7702Authorization,
} from '@dynamic-labs-sdk/evm';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import type { SignAuthorizationReturnType } from 'viem/accounts';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '../../../ErrorMessage';

type DelegationTabProps = {
  walletAccount: EvmWalletAccount;
};

export const DelegationTab: FC<DelegationTabProps> = ({ walletAccount }) => {
  const [signedAuth, setSignedAuth] = useState<SignAuthorizationReturnType | null>(null);
  const [useSignedAuth, setUseSignedAuth] = useState(true);

  const {
    data: isDelegated,
    isLoading: isCheckingDelegation,
    refetch: refetchDelegation,
    isFetching: isDelegationQueryFetching,
  } = useQuery({
    queryFn: () => is7702DelegationActive({ walletAccount }),
    queryKey: ['evm7702Delegation', walletAccount.id],
  });

  const {
    mutate: handleSignAuth,
    data: signAuthResult,
    error: signAuthError,
    isPending: isSigningAuth,
    reset: resetSignAuth,
  } = useMutation({
    mutationFn: async () => {
      const auth = await sign7702Authorization({ walletAccount });
      setSignedAuth(auth);
      return auth;
    },
  });

  const {
    mutate: handleActivate,
    data: activateResult,
    error: activateError,
    isPending: isActivating,
    reset: resetActivate,
  } = useMutation({
    mutationFn: async () => {
      const authorization =
        useSignedAuth && signedAuth ? signedAuth : undefined;
      const result = await activate7702Delegation({
        authorization,
        walletAccount,
      });
      void refetchDelegation();
      return result;
    },
  });

  return (
    <div className="space-y-5">
      {/* Delegation Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">7702 Delegation Status</Label>
          <button
            onClick={() => void refetchDelegation()}
            disabled={isDelegationQueryFetching}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer disabled:cursor-default"
          >
            <RefreshCw
              className={`w-3 h-3 ${isDelegationQueryFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 flex items-center gap-2">
          {isCheckingDelegation ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              Checking...
            </div>
          ) : (
            <>
              <span
                className={`w-2 h-2 rounded-full ${
                  isDelegated ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                }`}
              />
              <span className="text-sm font-medium">
                {isDelegated ? 'Delegated' : 'Not delegated'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sign 7702 Authorization */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sign 7702 Authorization</Label>
        <p className="text-xs text-muted-foreground">
          Signs an EIP-7702 authorization to delegate this wallet to the gasless
          contract. The result can be passed to Activate Delegation below.
        </p>
        <Button
          size="sm"
          onClick={() => {
            resetSignAuth();
            handleSignAuth();
          }}
          loading={isSigningAuth}
          disabled={isSigningAuth}
        >
          Sign Authorization
        </Button>

        <ErrorMessage
          error={signAuthError}
          defaultMessage="Failed to sign 7702 authorization"
          className="text-left"
        />

        {signAuthResult && (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Signed Authorization
            </p>
            <pre className="font-mono text-[10px] text-muted-foreground break-all whitespace-pre-wrap max-h-32 overflow-y-auto">
              {JSON.stringify(
                signAuthResult,
                (_key, value) =>
                  typeof value === 'bigint' ? value.toString() : value,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Activate 7702 Delegation */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Activate 7702 Delegation</Label>
        <p className="text-xs text-muted-foreground">
          Sends a sponsored transaction to activate 7702 delegation. If no
          signed authorization is provided, one will be signed automatically.
        </p>

        <div className="flex items-center gap-2">
          <Checkbox
            id="use-signed-auth"
            checked={useSignedAuth}
            onCheckedChange={setUseSignedAuth}
            disabled={!signedAuth}
          />
          <label
            htmlFor="use-signed-auth"
            className={`text-xs ${signedAuth ? 'text-foreground' : 'text-muted-foreground/50'}`}
          >
            Use signed authorization from above
          </label>
        </div>

        <Button
          size="sm"
          onClick={() => {
            resetActivate();
            handleActivate();
          }}
          loading={isActivating}
          disabled={isActivating}
        >
          Activate Delegation
        </Button>

        <ErrorMessage
          error={activateError}
          defaultMessage="Failed to activate delegation"
          className="text-left"
        />

        {activateResult && (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Transaction Hash
            </p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {activateResult.transactionHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
