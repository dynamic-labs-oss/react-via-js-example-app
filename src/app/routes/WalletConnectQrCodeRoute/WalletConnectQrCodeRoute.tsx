import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/ui/button';
import { ModalLayout } from '../../components/ModalLayout/ModalLayout';
import { WalletConnectQrCode } from '../../components/walletConnect/WalletConnectQrCode';

export const WalletConnectQrCodeRoute: FC = () => {
  const navigate = useNavigate();

  const handleConnectionComplete = () => {
    navigate('/');
  };

  return (
    <ModalLayout title="Sign in to your account">
      <WalletConnectQrCode onConnectionComplete={handleConnectionComplete} />

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => navigate('/auth')}
      >
        Back
      </Button>
    </ModalLayout>
  );
};
