import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/ui/button';
import { ModalLayout } from '../../components/ModalLayout/ModalLayout';
import { WalletConnectWalletList } from '../../components/walletConnect/WalletConnectWalletList';

export const WalletConnectWalletListRoute: FC = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();

  const handleBack = () => {
    if (selectedGroupId) {
      setSelectedGroupId(undefined);
    } else {
      navigate('/auth');
    }
  };

  const handleConnectionComplete = () => {
    navigate('/wallets');
  };

  return (
    <ModalLayout title="Select a wallet">
      <WalletConnectWalletList
        onConnectionComplete={handleConnectionComplete}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
      />

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleBack}
      >
        Back
      </Button>
    </ModalLayout>
  );
};
