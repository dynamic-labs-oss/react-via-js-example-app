import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { FC } from 'react';

import type { ValidationBadgeProps } from '../SimulateTransactionDialog.types';

export const ValidationBadge: FC<ValidationBadgeProps> = ({ validation }) => {
  if (!validation) return null;

  const configs = {
    benign: {
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: CheckCircle,
      textColor: 'text-emerald-600',
    },
    malicious: {
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      icon: AlertCircle,
      textColor: 'text-red-600',
    },
    warning: {
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      icon: AlertTriangle,
      textColor: 'text-yellow-600',
    },
  };

  // Normalize result to lowercase and provide fallback
  const resultKey = (validation.result?.toLowerCase() ||
    'warning') as keyof typeof configs;
  const config = configs[resultKey] || configs.warning;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} px-3 py-2.5 flex items-start gap-2`}
    >
      <Icon className={`w-4 h-4 ${config.textColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.textColor} capitalize`}>
          {validation.result}
        </p>
        {validation.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {validation.description}
          </p>
        )}
        {validation.reason && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Reason: {validation.reason}
          </p>
        )}
      </div>
    </div>
  );
};
