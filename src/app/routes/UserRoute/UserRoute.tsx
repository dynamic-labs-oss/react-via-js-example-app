import {
  deleteUser,
  isPendingRecoveryCodesAcknowledgment,
  isUserMissingMfaAuth,
  isUserOnboardingComplete,
  refreshAuth,
  refreshUser,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Check, Clock, Code, Shield, User as UserIcon } from 'lucide-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { UpdateUserDialog } from '../../components/UpdateUserDialog';
import { useSessionExpiresAt } from '../../hooks/useSessionExpiresAt';
import { useUser } from '../../hooks/useUser';

export const UserRoute: FC = () => {
  const user = useUser();
  const sessionExpiresAt = useSessionExpiresAt();
  const navigate = useNavigate();

  const onboardingComplete = user ? isUserOnboardingComplete() : false;
  const hasMissingKycFields = Boolean(user?.missingFields?.length);
  const needsMfaAuth = user ? isUserMissingMfaAuth() : false;
  const needsRecoveryAcknowledgment = user
    ? isPendingRecoveryCodesAcknowledgment()
    : false;

  const {
    mutate: handleDeleteUser,
    isPending,
    error,
  } = useMutation({
    mutationFn: () => deleteUser(),
    onSuccess: () => {
      navigate('/auth');
    },
  });

  const {
    mutate: handleRefreshAuth,
    isPending: isRefreshAuthPending,
    error: refreshAuthError,
  } = useMutation({
    mutationFn: () => refreshAuth(),
  });

  const {
    mutate: handleRefreshUser,
    isPending: isRefreshUserPending,
    error: refreshUserError,
  } = useMutation({
    mutationFn: () => refreshUser(),
  });

  const onDeleteUserClick = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      handleDeleteUser();
    }
  };

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              User
            </h1>
            {user?.email && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.email}
              </p>
            )}
          </div>

          {user && (
            <div className="flex flex-wrap gap-2 [&_button]:rounded-full [&_button]:h-7 [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:shadow-none">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefreshAuth()}
                loading={isRefreshAuthPending}
              >
                Refresh Auth
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefreshUser()}
                loading={isRefreshUserPending}
              >
                Refresh User
              </Button>
              <UpdateUserDialog />
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
                onClick={onDeleteUserClick}
                loading={isPending}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Errors */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
            <ErrorMessage error={error} defaultMessage="Failed to delete user" />
          </div>
        )}
        {refreshAuthError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
            <ErrorMessage error={refreshAuthError} defaultMessage="Failed to refresh auth" />
          </div>
        )}
        {refreshUserError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
            <ErrorMessage error={refreshUserError} defaultMessage="Failed to refresh user" />
          </div>
        )}

        {/* Session & Onboarding cards */}
        {(sessionExpiresAt || user) && (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border/40">
            {/* Session */}
            {sessionExpiresAt && (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Session expires
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(sessionExpiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Onboarding status */}
            {user && (
              <div className="px-5 py-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  onboardingComplete ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                }`}>
                  {onboardingComplete ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Onboarding
                  </p>
                  <p className={`text-sm font-medium ${
                    onboardingComplete ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {onboardingComplete ? 'Complete' : 'Incomplete'}
                  </p>

                  {!onboardingComplete && (
                    <ul className="mt-2 space-y-1">
                      {hasMissingKycFields && (
                        <li className="text-xs text-muted-foreground">
                          Missing KYC: {user.missingFields?.map((f) => f.name).join(', ')}
                        </li>
                      )}
                      {needsMfaAuth && (
                        <li className="text-xs text-muted-foreground">
                          MFA authentication required
                        </li>
                      )}
                      {needsRecoveryAcknowledgment && (
                        <li className="text-xs text-muted-foreground">
                          Recovery codes acknowledgment pending
                        </li>
                      )}
                    </ul>
                  )}

                  <p className="mt-2 text-[11px] text-muted-foreground/60 font-mono">
                    isUserOnboardingComplete() = {String(onboardingComplete)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User data */}
        {user && (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
              <Code className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                User Data
              </p>
            </div>
            <div className="px-3 pb-3">
              <pre
                className="text-xs bg-muted/30 p-4 rounded-xl leading-5 overflow-x-auto text-foreground font-mono"
                data-testid="user-json"
              >
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!user && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No user data
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                User information will appear here once you are authenticated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
