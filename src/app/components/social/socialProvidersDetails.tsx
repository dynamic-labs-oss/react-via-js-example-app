import type { SocialProvider } from '@dynamic-labs-sdk/client';

import { AppleIcon, GithubIcon, GoogleIcon, KrakenIcon, XIcon } from '../icons/social';

export type SocialProviderDetails = {
  icon: React.ReactNode;
  key: SocialProvider;
  name: string;
};

export const SOCIAL_PROVIDERS_DETAILS: SocialProviderDetails[] = [
  {
    icon: <GoogleIcon className="w-6 h-6" />,
    key: 'google',
    name: 'Google',
  },
  {
    icon: <AppleIcon className="w-6 h-6" />,
    key: 'apple',
    name: 'Apple',
  },
  {
    icon: <GithubIcon className="w-6 h-6" />,
    key: 'github',
    name: 'GitHub',
  },
  {
    icon: <XIcon className="w-6 h-6" />,
    key: 'twitter',
    name: 'X (Twitter)',
  },
  {
    icon: <KrakenIcon className="w-6 h-6" />,
    key: 'kraken',
    name: 'Kraken',
  },
];
