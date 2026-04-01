import {
  completeDeviceRegistration,
  detectDeviceRegistrationRedirect,
  getDeviceRegistrationTokenFromUrl,
} from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCompleteDeviceRegistrationRedirect = () => {
  return useQuery({
    queryFn: async () => {
      const url = window.location.href;

      if (!detectDeviceRegistrationRedirect({ url })) {
        return true;
      }

      await completeDeviceRegistration({
        deviceToken: getDeviceRegistrationTokenFromUrl({ url }),
      });

      toast.success('Device registration completed successfully');

      return true;
    },
    queryKey: ['device-registration-redirect'],
    retry: false,
    staleTime: 0,
  });
};
