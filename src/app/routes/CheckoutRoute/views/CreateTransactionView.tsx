import type { CheckoutTransaction } from '@dynamic-labs-sdk/client';
import { createCheckoutTransaction } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

const PRESET_AMOUNTS = ['0.50', '1', '5'] as const;
const CHECKOUT_ID_STORAGE_KEY = 'dynamic-demo-checkout-id';

const getStoredCheckoutId = (): string =>
  localStorage.getItem(CHECKOUT_ID_STORAGE_KEY) ?? '';

const setStoredCheckoutId = (id: string) =>
  localStorage.setItem(CHECKOUT_ID_STORAGE_KEY, id);

type CreateTransactionViewProps = {
  onTransactionCreated: (transaction: CheckoutTransaction) => void;
};

export const CreateTransactionView: FC<CreateTransactionViewProps> = ({
  onTransactionCreated,
}) => {
  const [checkoutId, setCheckoutId] = useState(getStoredCheckoutId);
  const [amount, setAmount] = useState('1');
  const currency = 'USD';

  const handleCheckoutIdChange = (value: string) => {
    setCheckoutId(value);
    setStoredCheckoutId(value);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createCheckoutTransaction({ amount, checkoutId, currency }),
    onSuccess: (response) => onTransactionCreated(response.transaction),
  });

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0 || !checkoutId) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="checkout-id" className="text-sm font-medium">
          Checkout ID
        </label>
        <Input
          id="checkout-id"
          placeholder="Enter your checkout ID"
          value={checkoutId}
          onChange={(e) => handleCheckoutIdChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="checkout-amount" className="text-sm font-medium">
          Amount ({currency})
        </label>
        <Input
          id="checkout-amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        <div className="flex gap-1.5">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`text-xs font-medium px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                amount === preset
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:border-border'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      {createMutation.error && (
        <p className="text-sm text-destructive">
          {createMutation.error.message}
        </p>
      )}

      <Button
        className="w-full"
        disabled={!checkoutId || !amount || Number(amount) <= 0 || createMutation.isPending}
        onClick={handleSubmit}
      >
        {createMutation.isPending ? 'Creating...' : 'Continue'}
      </Button>
    </div>
  );
};
