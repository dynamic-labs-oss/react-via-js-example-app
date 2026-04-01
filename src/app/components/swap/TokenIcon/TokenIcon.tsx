import { type FC, useState } from 'react';

export type TokenIconProps = {
  logoURI?: string;
  symbol?: string;
};

export const TokenIcon: FC<TokenIconProps> = ({ symbol, logoURI }) => {
  const [imgError, setImgError] = useState(false);

  if (logoURI && !imgError) {
    return (
      <img
        className="w-4 h-4 rounded-full flex-shrink-0"
        src={logoURI}
        alt={symbol}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-semibold text-muted-foreground">
      {symbol?.slice(0, 2)}
    </span>
  );
};
