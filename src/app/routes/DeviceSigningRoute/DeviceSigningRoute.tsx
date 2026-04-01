import { getDeviceSigner, getNonce } from '@dynamic-labs-sdk/client/core';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, PenTool, ShieldCheck, XCircle } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '../../components/ErrorMessage';
import { dynamicClient } from '../../constants/dynamicClient';
import { useUser } from '../../hooks/useUser';
import { verifyP256Signature } from './verifyP256Signature';

export const DeviceSigningRoute: FC = () => {
  const user = useUser();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [signedMessage, setSignedMessage] = useState<string>();

  const {
    error: nonceError,
    mutate: handleFillNonce,
    isPending: isFetchingNonce,
  } = useMutation({
    mutationFn: async () => {
      const nonce = await getNonce(dynamicClient);
      setMessage(nonce);
      setSignature(undefined);
      setPublicKey(undefined);
      setSignedMessage(undefined);
      setVerified(undefined);
    },
  });

  const {
    error,
    mutate: handleSign,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      setSignature(undefined);
      setPublicKey(undefined);
      setSignedMessage(undefined);
      setVerified(undefined);

      const signer = await getDeviceSigner(dynamicClient);
      const [sig, key] = await Promise.all([
        signer.sign(message),
        signer.getPublicKey(),
      ]);

      setSignature(sig);
      setPublicKey(key);
      setSignedMessage(message);
    },
  });

  const [verified, setVerified] = useState<boolean>();

  const {
    error: verifyError,
    mutate: handleVerify,
    isPending: isVerifying,
  } = useMutation({
    mutationFn: async () => {
      setVerified(undefined);

      const result = await verifyP256Signature({
        message: signedMessage!,
        publicKeyHex: publicKey!,
        signatureHex: signature!,
      });

      setVerified(result);
    },
  });

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Device Signing
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign arbitrary payloads with your device key
            </p>
          </div>
        </div>

        {/* Sign form */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <PenTool className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Sign Message
            </p>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sign-message">Message</Label>
              <div className="flex gap-2">
                <Input
                  id="sign-message"
                  type="text"
                  placeholder="Enter message to sign"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setSignature(undefined);
                    setPublicKey(undefined);
                    setSignedMessage(undefined);
                    setVerified(undefined);
                  }}
                />
                <Button
                  variant="outline"
                  disabled={!user || isFetchingNonce}
                  loading={isFetchingNonce}
                  onClick={() => handleFillNonce()}
                >
                  Fill Nonce
                </Button>
              </div>
              <ErrorMessage
                error={nonceError}
                defaultMessage="Failed to fetch nonce"
                className="text-left"
              />
            </div>

            <Button
              disabled={!message || !user || isPending}
              loading={isPending}
              onClick={() => handleSign()}
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

            {publicKey && (
              <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Public Key
                </p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {publicKey}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verify section */}
        {signature && publicKey && (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Verify Signature
              </p>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Verify the signature against the signed message using the public
                key.
              </p>

              <Button
                variant="outline"
                disabled={isVerifying}
                loading={isVerifying}
                onClick={() => handleVerify()}
              >
                {isVerifying ? 'Verifying...' : 'Verify Signature'}
              </Button>

              <ErrorMessage
                error={verifyError}
                defaultMessage="Failed to verify signature"
                className="text-left"
              />

              {verified !== undefined && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    verified
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                      : 'bg-destructive/10 border border-destructive/30 text-destructive'
                  }`}
                >
                  {verified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verified — signature is valid
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Invalid — signature verification failed
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
