import { ShoppingCart } from 'lucide-react';
import type { FC } from 'react';

import { CheckoutWidget } from './CheckoutWidget';

export const CheckoutRoute: FC = () => {
  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Checkout
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create and settle on-chain payment transactions
          </p>
        </div>

        <CheckoutWidget />
      </div>
    </div>
  );
};
