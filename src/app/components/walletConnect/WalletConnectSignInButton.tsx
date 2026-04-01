import type { FC } from 'react';

import { Button } from '../../../components/ui/button';
import { WalletConnectIcon } from '../icons/thirdParty';

type WalletConnectSignInButtonProps = {
  onClick: () => void;
  text?: string;
};

export const WalletConnectSignInButton: FC<WalletConnectSignInButtonProps> = ({
  text = 'Sign in with WalletConnect',
  onClick,
}) => {
  return (
    <Button onClick={onClick} className="w-full h-11" variant="outline">
      <WalletConnectIcon className="w-5! h-5!" />
      {text}
    </Button>
  );
};
