import { useQuery } from '@tanstack/react-query';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import QRCodeUtil from 'qrcode';

import { cn } from '../../../utils/cn';

type QrCodeProps = {
  className?: string;
  ecl?: QRCodeErrorCorrectionLevel;
  value: string | null;
};

const generateQrCode = async (
  value: string,
  ecl: QRCodeErrorCorrectionLevel
) => {
  return QRCodeUtil.toDataURL(value, {
    errorCorrectionLevel: ecl,
  });
};

const QrCodeSkeleton = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-[250px] h-[250px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export const QrCode = ({ ecl = 'Q', value, className }: QrCodeProps) => {
  const { data, isLoading } = useQuery({
    queryFn: () => (value ? generateQrCode(value, ecl) : Promise.resolve(null)),
    queryKey: ['qrcode', value, ecl],
  });

  if (isLoading || !value) {
    return <QrCodeSkeleton />;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-[250px] h-[250px]',
        className
      )}
    >
      {data && <img width={250} height={250} src={data} alt="QR Code" />}
    </div>
  );
};
