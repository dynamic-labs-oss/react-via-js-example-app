import { ArrowLeftRight } from 'lucide-react';
import type { FC } from 'react';

import { FlowWidget } from './FlowWidget';

export const FlowRoute: FC = () => {
  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Flow
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-chain payment flows powered by Dynamic
          </p>
        </div>

        <FlowWidget />
      </div>
    </div>
  );
};
