import type { SwapQuoteResponse } from '@dynamic-labs-sdk/client';
import { ArrowDownUp } from 'lucide-react';
import type { FC } from 'react';

import { TokenIcon } from '../TokenIcon';
import { toHumanAmount } from '../utils/toHumanAmount';

export type QuoteSummaryProps = {
  quote: SwapQuoteResponse;
};

export const QuoteSummary: FC<QuoteSummaryProps> = ({ quote }) => (
  <div className="rounded-xl border border-border/50 overflow-hidden flex flex-col items-center justify-center text-center">
    <div className="px-4 py-3 bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground mb-1">You send</p>
      <div className="flex items-center gap-2">
        {quote.from.token.logoURI && (
          <TokenIcon
            logoURI={quote.from.token.logoURI}
            symbol={quote.from.token.symbol}
          />
        )}
        <p className="text-sm font-semibold">
          {toHumanAmount(quote.from.amount, quote.from.token.decimals)}{' '}
          {quote.from.token.symbol}
        </p>
        {quote.from.amountUSD && (
          <span className="text-xs text-muted-foreground">
            ~${quote.from.amountUSD}
          </span>
        )}
      </div>
    </div>

    <div className="flex items-center justify-center py-1 text-muted-foreground">
      <ArrowDownUp className="w-3.5 h-3.5" />
    </div>

    <div className="px-4 py-3 bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        You receive
      </p>
      <div className="flex items-center gap-2">
        {quote.to.token.logoURI && (
          <TokenIcon
            logoURI={quote.to.token.logoURI}
            symbol={quote.to.token.symbol}
          />
        )}
        <p className="text-sm font-semibold">
          {toHumanAmount(quote.to.amount, quote.to.token.decimals)}{' '}
          {quote.to.token.symbol}
        </p>
        {quote.to.amountUSD && (
          <span className="text-xs text-muted-foreground">
            ~${quote.to.amountUSD}
          </span>
        )}
      </div>
    </div>
  </div>
);
