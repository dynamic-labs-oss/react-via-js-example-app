import { isDeviceRegistrationRequired } from '@dynamic-labs-sdk/client';
import { Mail, X } from 'lucide-react';
import { type FC, useState } from 'react';

import { useClientEvent } from '../../hooks/useClientEvent';
import { useUser } from '../../hooks/useUser';

export const DeviceRegistrationBanner: FC = () => {
  const user = useUser();
  const [dismissed, setDismissed] = useState(false);

  useClientEvent({
    event: 'deviceRegistrationCompleted',
    listener: () => {
      setDismissed(true);
    },
  });

  useClientEvent({
    event: 'deviceRegistrationCompletedInAnotherTab',
    listener: () => {
      setDismissed(true);
    },
  });

  const isRequired = user ? isDeviceRegistrationRequired(user) : false;

  if (!isRequired || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 rounded-2xl bg-card border border-border/60 shadow-card px-5 py-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <Mail className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Device registration required
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          A verification email has been sent to your inbox. Please check your
          email and follow the link to register this device.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4 text-muted-foreground/40" />
      </button>
    </div>
  );
};
