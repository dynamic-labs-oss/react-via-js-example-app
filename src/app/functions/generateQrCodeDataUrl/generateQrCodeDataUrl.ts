import QRCodeUtil from 'qrcode';

type GenerateQrCodeDataUrlParams = {
  size: number;
  value: string;
};

/**
 * Renders a value as a branded QR-code data URL ready to drop into an
 * `<img>` tag.
 *
 * Uses `errorCorrectionLevel: 'H'` so the QR survives the wallet-icon
 * overlay drawn on top by `BrandedQrCode`, and bakes in the demo's brand
 * colors so the output matches the rest of the modal.
 */
export const generateQrCodeDataUrl = ({
  size,
  value,
}: GenerateQrCodeDataUrlParams): Promise<string> =>
  QRCodeUtil.toDataURL(value, {
    color: { dark: '#0a0e27', light: '#ffffff' },
    errorCorrectionLevel: 'H',
    margin: 2,
    width: size,
  });
