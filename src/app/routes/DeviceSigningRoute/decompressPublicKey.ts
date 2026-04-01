import { hexToBytes } from './hexToBytes';

export const decompressPublicKey = (compressedHex: string): Uint8Array => {
  const compressed = hexToBytes(compressedHex);

  // P-256 prime
  const p = BigInt(
    '0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'
  );
  const a = p - 3n;
  const b = BigInt(
    '0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'
  );

  const prefix = compressed[0];
  const xBytes = compressed.slice(1);
  let x = 0n;
  for (const byte of xBytes) {
    x = (x << 8n) | BigInt(byte);
  }

  // y^2 = x^3 + ax + b mod p
  const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod;
      exp = exp >> 1n;
      base = (base * base) % mod;
    }
    return result;
  };

  const ySquared = (modPow(x, 3n, p) + a * x + b) % p;
  // sqrt via p ≡ 3 mod 4 → y = ySquared^((p+1)/4) mod p
  let y = modPow(ySquared, (p + 1n) / 4n, p);

  const isEven = y % 2n === 0n;
  const needEven = prefix === 0x02;
  if (isEven !== needEven) {
    y = p - y;
  }

  const xArr = new Uint8Array(32);
  const yArr = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    xArr[i] = Number(x & 0xffn);
    x >>= 8n;
    yArr[i] = Number(y & 0xffn);
    y >>= 8n;
  }

  // Uncompressed format: 0x04 || x || y
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  uncompressed.set(xArr, 1);
  uncompressed.set(yArr, 33);
  return uncompressed;
};
