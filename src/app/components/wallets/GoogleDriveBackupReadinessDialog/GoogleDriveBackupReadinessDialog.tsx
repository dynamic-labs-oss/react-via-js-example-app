import {
  GOOGLE_DRIVE_BACKUP_REQUIRED_SCOPES,
  type GoogleDriveBackupReadiness,
  type WalletAccount,
  getGoogleDriveBackupReadiness,
  signInWithSocialRedirect,
} from '@dynamic-labs-sdk/client';
import { backupWaasKeySharesToGoogleDrive } from '@dynamic-labs-sdk/client/waas';
import { useMutation } from '@tanstack/react-query';
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

type GoogleDriveBackupReadinessDialogProps = {
  walletAccount: WalletAccount;
};

const STATUS_LABEL: Record<GoogleDriveBackupReadiness['status'], string> = {
  'needs-access': 'Needs access',
  ready: 'Ready',
};

const STATUS_CLASS: Record<GoogleDriveBackupReadiness['status'], string> = {
  'needs-access': 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
};

export const GoogleDriveBackupReadinessDialog: FC<
  GoogleDriveBackupReadinessDialogProps
> = ({ walletAccount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    mutate: checkReadiness,
    data: readiness,
    error,
    isPending: isChecking,
    reset,
  } = useMutation({
    mutationFn: () => getGoogleDriveBackupReadiness(),
    onError: (e) => {
      toast.error('Drive readiness check failed', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    },
    onSuccess: (result) => {
      toast.success(`Readiness: ${STATUS_LABEL[result.status]}`);
    },
  });

  const [password, setPassword] = useState('');
  const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState('');

  const { mutate: backup, isPending: isBackingUp } = useMutation({
    mutationFn: () =>
      backupWaasKeySharesToGoogleDrive({
        walletAccount,
        ...(password ? { password } : {}),
        ...(googleDriveAccessToken ? { googleDriveAccessToken } : {}),
      }),
    onError: (e) => {
      toast.error('Backup failed', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    },
    onSuccess: () => {
      toast.success('Backed up to Google Drive');
    },
  });

  const handleRelink = useCallback(async () => {
    await signInWithSocialRedirect({
      provider: 'google',
      redirectUrl: window.location.href,
    });
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Drive Backup Readiness
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogTitle>Google Drive Backup Readiness</DialogTitle>

        <DialogDescription className="text-sm">
          Pre-flight check for backing up keyshares of wallet{' '}
          <span className="font-mono">{walletAccount.address}</span> to Google
          Drive. Validates the user&apos;s stored Google OAuth scopes before
          spending an MPC reshare ceremony.
        </DialogDescription>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground mb-1.5">
              Required scopes
            </p>
            <ul className="text-[11px] font-mono text-muted-foreground space-y-0.5">
              {GOOGLE_DRIVE_BACKUP_REQUIRED_SCOPES.map((scope) => (
                <li key={scope}>{scope}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              variant="default"
              onClick={() => checkReadiness()}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? 'Checking...' : 'Check readiness'}
            </Button>
          </div>

          {readiness && (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Status
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    STATUS_CLASS[readiness.status]
                  }`}
                >
                  {STATUS_LABEL[readiness.status]}
                </span>
              </div>

              {readiness.missingScopes.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-foreground mb-0.5">
                    Missing scopes
                  </p>
                  <ul className="text-[11px] font-mono text-muted-foreground space-y-0.5">
                    {readiness.missingScopes.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                </div>
              )}

              {readiness.status === 'needs-access' &&
                readiness.missingScopes.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">
                    Legacy token (scopes captured before tracking shipped) —
                    re-link to populate.
                  </p>
                )}

              {readiness.accessToken && (
                <p className="text-[11px] font-mono text-muted-foreground truncate">
                  accessToken:{' '}
                  {`${readiness.accessToken.slice(
                    0,
                    16
                  )}…${readiness.accessToken.slice(-4)}`}
                </p>
              )}
            </div>
          )}

          {error instanceof Error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
              <p className="text-[11px] text-destructive">{error.message}</p>
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-sm">Back up to Google Drive</h3>
            <p className="text-xs text-muted-foreground">
              Optionally supply a Drive-scoped access token (e.g. from the OAuth
              playground). When provided, the SDK uses it directly instead of the
              stored OAuth token — useful for external auth, and avoids a second
              Google consent.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (optional)"
              className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={googleDriveAccessToken}
              onChange={(e) => setGoogleDriveAccessToken(e.target.value)}
              placeholder="Google Drive access token (optional — Drive-scoped)"
              className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
            />
            <Button
              variant="default"
              onClick={() => backup()}
              disabled={isBackingUp}
              className="w-full"
            >
              {isBackingUp ? 'Backing up...' : 'Backup to Google Drive'}
            </Button>
          </div>

          {readiness?.status === 'needs-access' && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-sm">Re-link Google</h3>
              <p className="text-xs">
                Linking will navigate away to Google consent. After it
                completes, run the readiness check again.
              </p>
              <Button
                variant="outline"
                onClick={() => handleRelink()}
                className="w-full"
              >
                Re-link Google account
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
