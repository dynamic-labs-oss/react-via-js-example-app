import type { FC } from 'react';

type BrandedWalletHeaderProps = {
  iconSrc: string;
  name: string;
  primaryColor?: string;
};

/**
 * Icon + name header shown at the top of the branded WalletConnect QR view.
 * Highlights the wallet's `primaryColor` as a ring around the icon when
 * available.
 */
export const BrandedWalletHeader: FC<BrandedWalletHeaderProps> = ({
  iconSrc,
  name,
  primaryColor,
}) => (
  <div className="flex items-center gap-3 self-center">
    <div
      className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden"
      style={
        primaryColor ? { boxShadow: `0 0 0 2px ${primaryColor}` } : undefined
      }
    >
      {iconSrc ? (
        <img
          alt={`${name} icon`}
          className="w-8 h-8 rounded-lg object-contain"
          src={iconSrc}
        />
      ) : null}
    </div>
    <p className="text-sm font-semibold text-foreground">{name}</p>
  </div>
);
