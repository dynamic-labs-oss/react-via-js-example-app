import type { FC } from 'react';

import { Switch } from '../../../components/ui/switch';
import {
  setShouldAutoVerifyWallets,
  useShouldAutoVerifyWallets,
} from '../../../store/shouldAutoVerifyWallets';
import type { ClassStyleProps } from '../../../types/ClassStyleProps';
import { cn } from '../../../utils/cn';

type AutoVerifyWalletsSwitchProps = ClassStyleProps & {
  label?: string;
};

export const AutoVerifyWalletsSwitch: FC<AutoVerifyWalletsSwitchProps> = ({
  label = 'Also verify wallets',
  className,
  style,
}) => {
  const shouldAutoVerifyWallets = useShouldAutoVerifyWallets();

  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        className
      )}
      htmlFor="auto-verify-wallets"
      style={style}
    >
      <Switch
        id="auto-verify-wallets"
        checked={shouldAutoVerifyWallets}
        onCheckedChange={setShouldAutoVerifyWallets}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  );
};
