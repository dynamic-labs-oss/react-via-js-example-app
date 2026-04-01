import { decompressPublicKey } from './decompressPublicKey';
import { hexToBytes } from './hexToBytes';

export const verifyP256Signature = async ({
  message,
  signatureHex,
  publicKeyHex,
}: {
  message: string;
  publicKeyHex: string;
  signatureHex: string;
}): Promise<boolean> => {
  const rawPublicKey = decompressPublicKey(publicKeyHex);

  const publicKey = await crypto.subtle.importKey(
    'raw',
    rawPublicKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  );

  const signatureBytes = hexToBytes(signatureHex);
  const messageBytes = new TextEncoder().encode(message);

  return crypto.subtle.verify(
    { hash: 'SHA-256', name: 'ECDSA' },
    publicKey,
    signatureBytes,
    messageBytes
  );
};
