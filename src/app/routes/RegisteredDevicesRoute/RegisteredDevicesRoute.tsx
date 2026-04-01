import {
  getRegisteredDevices,
  revokeAllRegisteredDevices,
} from '@dynamic-labs-sdk/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Smartphone } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { RegisteredDeviceCard } from '../../components/RegisteredDeviceCard';

export const RegisteredDevicesRoute: FC = () => {
  const {
    data: devices,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: () => getRegisteredDevices(),
    queryKey: ['registered-devices'],
  });

  const { mutate: handleRemoveAll } = useMutation({
    mutationFn: async () => {
      await revokeAllRegisteredDevices();
    },
    onSuccess: () => {
      void refetch();
    },
  });

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Registered Devices
            </h1>
            {devices && devices.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {devices.length} registered device
                {devices.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {devices && devices.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-7 px-3 text-xs font-medium shadow-none border border-border/50 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
              onClick={() => handleRemoveAll()}
            >
              Remove All
            </Button>
          )}
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
                  <RegisteredDeviceCard
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
              <Smartphone className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                No registered devices
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">
                Registered devices will appear here once a device has been
                registered to your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
