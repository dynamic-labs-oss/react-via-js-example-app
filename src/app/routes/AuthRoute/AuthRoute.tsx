import type { WalletAccount, WalletProviderData } from '@dynamic-labs-sdk/client';
import {
  type OTPVerification,
  authenticateTotpMfaDevice,
  getMfaDevices,
  isUserMissingMfaAuth,
  verifyOTP,
  verifyWalletAccount,
} from '@dynamic-labs-sdk/client';
import { type FC, useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { promptCaptchaIfRequired } from '../../../store/captcha';
import { isLedgerMode, useLedgerMode } from '../../../store/ledgerMode';
import { AutoVerifyWalletsSwitch } from '../../components/AutoVerifyWalletsSwitch';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LedgerModeSwitch } from '../../components/LedgerModeSwitch';
import { ModalLayout } from '../../components/ModalLayout/ModalLayout';
import { OTPConfirmationView } from '../../components/OTPConfirmationView';
import { WalletNeedsVerifyView } from '../../components/WalletNeedsVerifyView/WalletNeedsVerifyView';
import { connectWalletWithAutoVerify } from '../../functions/connectWalletWithAutoVerify/connectWalletWithAutoVerify';
import { onSignIn } from '../../functions/onSignIn/onSignIn';
import { useUser } from '../../hooks/useUser';
import { useWalletAccounts } from '../../hooks/useWalletAccounts';
import { useWalletProviders } from '../../hooks/useWalletProviders';
import { PasskeySignIn } from './PasskeySignIn';
import { SendOTPFormSection } from './SendOTPFormSection';
import { SocialSignIn } from './SocialSignIn';
import { WalletConnectSignIn } from './WalletConnectSignIn';
import { WalletList } from './WalletList';

const OrDivider: FC<{ text?: string }> = ({ text = 'or' }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-border/60" />
    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium select-none">
      {text}
    </span>
    <div className="flex-1 h-px bg-border/60" />
  </div>
);

export const AuthRoute: FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const allWalletProviders = useWalletProviders();
  const ledgerMode = useLedgerMode();
  const walletAccounts = useWalletAccounts();

  const walletProviders = useMemo(
    () =>
      ledgerMode
        ? allWalletProviders.filter((p) =>
            p.metadata.supportedHardwareWalletVendors?.includes('ledger')
          )
        : allWalletProviders,
    [allWalletProviders, ledgerMode]
  );

  const [authState, setAuthState] = useState<
    | {
        otpVerification: OTPVerification;
        type: 'otp';
      }
    | {
        type: 'mfa';
      }
    | {
        type: 'wallet';
        walletProvider: WalletProviderData;
      }
    | {
        type: 'wallet-connected-needs-verify';
        walletAccount: WalletAccount;
        walletProvider: WalletProviderData;
      }
    | null
  >(null);

  const [walletSignInError, setWalletSignInError] = useState<unknown>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const walletSignIn = useCallback(
    async (walletProvider: WalletProviderData) => {
      try {
        setAuthState({ type: 'wallet', walletProvider });
        setWalletSignInError(null);

        await promptCaptchaIfRequired();

        const hardwareWalletVendor = isLedgerMode()
          ? ('ledger' as const)
          : undefined;

        const result = await connectWalletWithAutoVerify({
          hardwareWalletVendor,
          walletProvider,
        });

        if (result.status === 'needs-verify') {
          setAuthState({
            type: 'wallet-connected-needs-verify',
            walletAccount: result.walletAccount,
            walletProvider: result.walletProvider,
          });
          return;
        }

        await onSignIn();
        setAuthState(null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        setWalletSignInError(error);
        setAuthState(null);
      }
    },
    []
  );

  const handleVerify = useCallback(async () => {
    if (authState?.type !== 'wallet-connected-needs-verify') return;

    try {
      setIsVerifying(true);
      setWalletSignInError(null);

      await verifyWalletAccount({ walletAccount: authState.walletAccount });
      await onSignIn();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setWalletSignInError(error);
    } finally {
      setIsVerifying(false);
    }
  }, [authState]);

  if (user) {
    return <Navigate to="/" />;
  }

  if (walletAccounts.length > 0) {
    return <Navigate to="/wallets" />;
  }

  if (authState?.type === 'mfa') {
    return (
      <ModalLayout title="Verify your identity">
        <div className="flex flex-col items-center gap-1 pb-1">
          <p className="text-sm text-muted-foreground text-center">
            Enter the code from your authenticator app
          </p>
        </div>
        <OTPConfirmationView
          onSubmit={async (code: string) => {
            const devices = await getMfaDevices();
            const device = devices[0];

            await authenticateTotpMfaDevice({
              code,
              deviceId: device?.id,
            });

            await onSignIn();
          }}
          onCancel={() => setAuthState(null)}
        />
      </ModalLayout>
    );
  }

  if (authState?.type === 'otp') {
    return (
      <ModalLayout title="Sign in to your account">
        <OTPConfirmationView
          onSubmit={async (otp: string) => {
            await verifyOTP({
              otpVerification: authState?.otpVerification,
              verificationToken: otp,
            });

            if (isUserMissingMfaAuth()) {
              setAuthState({ type: 'mfa' });
              return;
            }

            await onSignIn();
          }}
          onCancel={() => setAuthState(null)}
        />
      </ModalLayout>
    );
  }

  if (authState?.type === 'wallet-connected-needs-verify') {
    return (
      <ModalLayout title="Sign in to your account">
        <WalletNeedsVerifyView
          error={walletSignInError}
          isVerifying={isVerifying}
          onVerify={handleVerify}
          walletAccount={authState.walletAccount}
          walletProvider={authState.walletProvider}
        />
      </ModalLayout>
    );
  }

  if (authState?.type === 'wallet') {
    return (
      <ModalLayout title="Sign in to your account">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
            <img
              alt={authState.walletProvider.metadata.displayName}
              src={authState.walletProvider.metadata.icon}
              className="w-10 h-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Connecting to {authState.walletProvider.metadata.displayName}…
          </p>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout title="Sign in to your account">
      {/* Email / Phone OTP */}
      <SendOTPFormSection
        onOtpVerification={(otpVerification) =>
          setAuthState({ otpVerification, type: 'otp' })
        }
      />

      <OrDivider />

      {/* Social + Passkey + WalletConnect */}
      <div className="flex flex-col gap-3">
        <SocialSignIn />
        <PasskeySignIn />
        <WalletConnectSignIn />
      </div>

      <OrDivider text="or connect a wallet" />

      {/* Wallets */}
      <div className="flex flex-col gap-3">
        <AutoVerifyWalletsSwitch />
        <LedgerModeSwitch />
        <ErrorMessage error={walletSignInError} />
        <WalletList
          walletProviders={walletProviders}
          onClick={walletSignIn}
          onMultiChainProviderClick={(providerKey) =>
            navigate(`/auth/${providerKey}`)
          }
        />
      </div>
    </ModalLayout>
  );
};
