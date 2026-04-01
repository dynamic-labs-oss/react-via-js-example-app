import { signInWithPasskey } from '@dynamic-labs-sdk/client';
import { type FC } from 'react';

import { Button } from '../../../components/ui/button';
import { KeyIcon } from '../../components/icons/general/KeyIcon';
import { onSignIn } from '../../functions/onSignIn/onSignIn';

export const PasskeySignIn: FC = () => {
  const handlePasskeySignIn = async () => {
    await signInWithPasskey();

    await onSignIn();
  };

  return (
    <Button
      onClick={handlePasskeySignIn}
      variant="outline"
      className="w-full h-11"
    >
      <KeyIcon className="w-5! h-5!" />
      Sign in with Passkey
    </Button>
  );
};
