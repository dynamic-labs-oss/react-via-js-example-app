import type { VerifyResponse } from '@dynamic-labs-sdk/client';
import {
  authenticatePasskeyMFA,
  deletePasskey,
  getPasskeys,
  registerPasskey,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { Code, Fingerprint, Plus } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { MfaBanner } from '../../components/mfa/MfaBanner';
import { useUser } from '../../hooks/useUser';
import { PasskeyCard } from './PasskeyCard';

export const PasskeyRoute: FC = () => {
  const user = useUser();
  const [verifyResponse, setVerifyResponse] = useState<VerifyResponse | null>(
    null
  );

  const {
    data: passkeys = [],
    refetch,
    isPending,
  } = useQuery({
    enabled: !!user,
    queryFn: () => getPasskeys(),
    queryKey: ['passkeys', user?.id],
  });

  const handleAuthenticatePasskeyMfa = async () => {
    setVerifyResponse(null);

    const verifyResponse = await authenticatePasskeyMFA({
      createMfaToken: { singleUse: true },
    });

    setVerifyResponse(verifyResponse);
  };

  const handleDeletePasskey = (passkeyId: string) => {
    void deletePasskey({ passkeyId }).then(() => {
      void refetch();
    });
  };

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Passkeys
            </h1>
            {passkeys.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {passkeys.length} registered passkey
                {passkeys.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-2 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuthenticatePasskeyMfa}
            >
              Authenticate
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                void registerPasskey().then(() => {
                  void refetch();
                })
              }
            >
              <Plus className="w-3.5 h-3.5" />
              Register
            </Button>
          </div>
        </div>

        {/* MFA Banner */}
        <MfaBanner />

        {/* Verify response */}
        {verifyResponse && (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
              <Code className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Verify Response
              </p>
            </div>
            <div className="px-3 pb-3">
              <pre className="text-xs bg-muted/30 p-4 rounded-xl leading-5 overflow-x-auto text-foreground font-mono">
                {JSON.stringify(verifyResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Loading */}
        {isPending ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              Loading passkeys
            </div>
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No passkeys registered
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                Register a passkey to enable passwordless authentication.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="px-3 py-3">
              <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
                {passkeys.map((passkey) => (
                  <PasskeyCard
                    key={passkey.id}
                    passkey={passkey}
                    onDelete={handleDeletePasskey}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
