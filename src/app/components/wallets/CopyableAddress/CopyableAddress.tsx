import { Check, Copy } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

const truncateAddress = (address: string) => {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}\u2026${address.slice(-4)}`;
};

export const CopyableAddress: FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors cursor-pointer"
      title={address}
    >
      <span className="sr-only">{address}</span>
      {truncateAddress(address)}
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};
