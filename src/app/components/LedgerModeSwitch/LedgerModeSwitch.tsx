import type { FC } from 'react';

import { Switch } from '../../../components/ui/switch';
import {
  setLedgerMode,
  useLedgerMode,
} from '../../../store/ledgerMode';
import type { ClassStyleProps } from '../../../types/ClassStyleProps';
import { cn } from '../../../utils/cn';

type LedgerModeSwitchProps = ClassStyleProps & {
  label?: string;
};

export const LedgerModeSwitch: FC<LedgerModeSwitchProps> = ({
  label = 'Connect with Ledger',
  className,
  style,
}) => {
  const ledgerMode = useLedgerMode();

  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        className
      )}
      htmlFor="ledger-mode"
      style={style}
    >
      <Switch
        id="ledger-mode"
        checked={ledgerMode}
        onCheckedChange={setLedgerMode}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  );
};
