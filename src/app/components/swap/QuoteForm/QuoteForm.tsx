import { useAtomValue, useSetAtom } from 'jotai';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '../../ErrorMessage';
import { SLIPPAGE_OPTIONS } from '../constants';
import { DestinationSection } from '../DestinationSection';
import { SourceSection } from '../SourceSection';
import {
  getQuoteAtom,
  isQuotingAtom,
  quoteErrorAtom,
  slippageAtom,
} from '../swap.atoms';

export const QuoteForm: FC = () => {
  const slippage = useAtomValue(slippageAtom);
  const setSlippage = useSetAtom(slippageAtom);
  const isQuoting = useAtomValue(isQuotingAtom);
  const quoteError = useAtomValue(quoteErrorAtom);
  const fetchQuote = useSetAtom(getQuoteAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchQuote();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <SourceSection />

      <DestinationSection />

      <div className="space-y-2">
        <Label>Slippage Tolerance</Label>
        <div className="flex gap-2">
          {SLIPPAGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSlippage(opt)}
              className={`flex-1 h-8 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                slippage === opt
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
              }`}
            >
              {opt}%
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={isQuoting}>
        Get Quote
      </Button>

      <ErrorMessage
        error={quoteError}
        defaultMessage="Failed to get swap quote"
        className="text-left"
      />
    </form>
  );
};
