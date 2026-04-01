import type { FC } from 'react';

import { Button } from '../../../../components/ui/button';
import type { SocialProviderDetails } from '../socialProvidersDetails';

export type SocialButtonProps = {
  onClick: () => Promise<void>;
  providerDetails: SocialProviderDetails;
  showText?: boolean;
};

export const SocialButton: FC<SocialButtonProps> = ({
  onClick,
  providerDetails,
  showText = true,
}) => {
  return (
    <Button onClick={onClick} className="p-5" variant="outline">
      {providerDetails.icon}
      {showText && `Sign in with ${providerDetails.name}`}
    </Button>
  );
};
