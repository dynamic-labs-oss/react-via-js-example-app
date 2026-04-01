import { getMfaDevices } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { type FC } from 'react';

import { AddMfaDeviceDialog } from '../../components/mfa/AddMfaDeviceDialog';
import { MfaDeviceCard } from '../../components/mfa/MfaDeviceCard';

export const MfaRoute: FC = () => {
  const {
    data: devices,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: () => getMfaDevices(),
    queryKey: ['mfa-devices'],
  });

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              MFA Devices
            </h1>
            {devices && devices.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {devices.length} registered device
                {devices.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <AddMfaDeviceDialog
            onAdd={() => {
              void refetch();
            }}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              Loading devices
            </div>
          </div>
        )}

        {/* Device list */}
        {devices && devices.length > 0 && (
          <div className="rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="px-3 py-3">
              <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
                {devices.map((device) => (
                  <MfaDeviceCard
                    key={device.id}
                    device={device}
                    onDelete={() => {
                      void refetch();
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!devices || devices.length === 0) && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No MFA devices
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                Add an authenticator app to secure your account with
                multi-factor authentication.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
