import { type WalletAccount } from '@dynamic-labs-sdk/client';
import { ChevronDown } from 'lucide-react';
import { type FC, useState } from 'react';

export const WalletAddressesWithTypes: FC<{ walletAccount: WalletAccount }> = ({
  walletAccount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addressesWithTypes = walletAccount.addressesWithTypes;

  if (!addressesWithTypes || addressesWithTypes.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-pointer uppercase tracking-wider"
      >
        Addresses ({addressesWithTypes.length})
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded
            ? 'max-h-[600px] opacity-100 mt-3'
            : 'max-h-0 opacity-0 mt-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col gap-2.5">
          {addressesWithTypes.map((address) => (
            <div
              key={address.address}
              className="flex flex-col gap-2 border-l-2 border-border/50 pl-3"
            >
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                  Address
                </p>
                <p className="text-[13px] font-mono text-foreground/80 break-all leading-relaxed">
                  {address.address}
                </p>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                    Type
                  </p>
                  <p className="text-[13px] font-medium text-foreground">
                    {address.type.toUpperCase()}
                  </p>
                </div>

                {address.publicKey && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                      Public Key
                    </p>
                    <p className="text-[13px] font-mono text-foreground/80 break-all leading-relaxed">
                      {address.publicKey}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
