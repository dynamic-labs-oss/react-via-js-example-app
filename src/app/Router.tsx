import { waitForClientInitialized } from '@dynamic-labs-sdk/client';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { DeviceRegistrationBanner } from './components/DeviceRegistrationBanner/DeviceRegistrationBanner';
import { SpinnerIcon } from './components/icons/general/SpinnerIcon';
import { LeftNavigationPanel } from './components/LeftNavigationPanel';
import { ModalLayout } from './components/ModalLayout/ModalLayout';
import { ProtectRoute } from './components/ProtectRoute';
import { useCompleteDeviceRegistrationRedirect } from './hooks/useCompleteDeviceRegistrationRedirect';
import { AuthProviderRoute } from './routes/AuthProviderRoute';
import { AuthRoute } from './routes/AuthRoute';
import { CheckoutRoute } from './routes/CheckoutRoute';
import { DeviceSigningRoute } from './routes/DeviceSigningRoute';
import { FundingRoute } from './routes/FundingRoute';
import { MfaRoute } from './routes/MfaRoute';
import { NetworksRoute } from './routes/NetworksRoute';
import { PasskeyRoute } from './routes/PasskeyRoute';
import { RegisteredDevicesRoute } from './routes/RegisteredDevicesRoute';
import { SocialRoute } from './routes/SocialRoute';
import { UserRoute } from './routes/UserRoute';
import { WalletConnectQrCodeRoute } from './routes/WalletConnectQrCodeRoute';
import { WalletConnectWalletListRoute } from './routes/WalletConnectWalletListRoute';
import { WalletsRoute } from './routes/WalletsRoute';

export const Router: FC = () => {
  useCompleteDeviceRegistrationRedirect();

  const { data: isClientLoaded } = useQuery({
    initialData: false,
    queryFn: async () => {
      await waitForClientInitialized();

      return true;
    },
    queryKey: ['isClientLoaded'],
  });

  if (!isClientLoaded) {
    return (
      <ModalLayout>
        <SpinnerIcon className="w-11! h-11! animate-spin self-center my-12" />
      </ModalLayout>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <ProtectRoute>
                <LeftNavigationPanel />
                <DeviceRegistrationBanner />
                <Outlet />
              </ProtectRoute>
            </AppLayout>
          }
        >
          <Route index element={<Navigate to="/wallets" />} />
          <Route path="/wallets" element={<WalletsRoute />} />
          <Route path="/networks" element={<NetworksRoute />} />
          <Route path="/user" element={<UserRoute />} />
          <Route path="/social" element={<SocialRoute />} />
          <Route path="/mfa" element={<MfaRoute />} />
          <Route path="/passkey" element={<PasskeyRoute />} />
          <Route path="/funding" element={<FundingRoute />} />
          <Route path="/checkout" element={<CheckoutRoute />} />
          <Route path="/device-signing" element={<DeviceSigningRoute />} />
          <Route
            path="/registered-devices"
            element={<RegisteredDevicesRoute />}
          />
        </Route>

        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/auth/wallet-connect/"
          element={<WalletConnectQrCodeRoute />}
        />
        <Route
          path="/auth/wallet-connect/wallets"
          element={<WalletConnectWalletListRoute />}
        />
        <Route
          path="/auth/:walletProviderKey"
          element={<AuthProviderRoute />}
        />
      </Routes>
    </BrowserRouter>
  );
};
