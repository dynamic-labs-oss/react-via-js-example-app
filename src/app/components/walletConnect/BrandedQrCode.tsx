import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { cn } from '../../../utils/cn';
import { generateQrCodeDataUrl } from '../../functions/generateQrCodeDataUrl';

type BrandedQrCodeProps = {
  className?: string;
  iconAlt?: string;
  iconSrc?: string;
  primaryColor?: string;
  value: string | null;
};

const QR_SIZE = 260;
const ICON_SIZE = 56;

const Skeleton: FC<{ primaryColor?: string }> = ({ primaryColor }) => (
  <div
    className="rounded-xl border-4 bg-muted/40 animate-pulse"
    style={{
      borderColor: primaryColor ?? 'transparent',
      height: QR_SIZE,
      width: QR_SIZE,
    }}
  />
);

/**
 * Renders a WalletConnect-style branded QR code:
 * - Border colored with the wallet's `primaryColor`
 * - Wallet icon (`iconSrc`) overlaid at the center
 *
 * Uses error correction level `H` so the QR remains scannable behind the
 * centered logo. Falls back to a skeleton when `value` is null.
 */
export const BrandedQrCode: FC<BrandedQrCodeProps> = ({
  className,
  iconAlt,
  iconSrc,
  primaryColor,
  value,
}) => {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      value
        ? generateQrCodeDataUrl({ size: QR_SIZE, value })
        : Promise.resolve(null),
    queryKey: ['branded-qrcode', value],
  });

  if (isLoading || !value || !data) {
    return <Skeleton primaryColor={primaryColor} />;
  }

  return (
    <div
      className={cn('relative rounded-xl border-4 overflow-hidden', className)}
      style={{
        borderColor: primaryColor ?? 'transparent',
        height: QR_SIZE,
        width: QR_SIZE,
      }}
    >
      <img alt="QR Code" height={QR_SIZE} src={data} width={QR_SIZE} />

      {iconSrc && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white flex items-center justify-center shadow-md"
          style={{
            height: ICON_SIZE,
            padding: 4,
            width: ICON_SIZE,
          }}
        >
          <img
            alt={iconAlt ?? 'wallet icon'}
            className="w-full h-full rounded-lg object-contain"
            src={iconSrc}
          />
        </div>
      )}
    </div>
  );
};
