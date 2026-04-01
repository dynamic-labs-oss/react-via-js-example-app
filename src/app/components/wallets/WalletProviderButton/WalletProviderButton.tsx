import type { Chain } from '@dynamic-labs-sdk/client';
import type { Iconic } from '@dynamic-labs/iconic';
import { type FC, useCallback } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '../../../../components/ui/button';
import type { ClassStyleProps } from '../../../../types/ClassStyleProps';

type WalletProviderButtonProps = ClassStyleProps & {
  IconComponent?: Iconic;
  chain?: Chain;
  chainIcons?: {
    component: Iconic;
    key: string;
  }[];
  disabled?: boolean;
  displayName: string;
  groupKey: string;
  iconSrc?: string;
  loading?: boolean;
  onClick: () => void;
};

export const WalletProviderButton: FC<WalletProviderButtonProps> = ({
  chain,
  chainIcons = [],
  className,
  disabled,
  displayName,
  groupKey,
  IconComponent,
  iconSrc,
  loading,
  onClick,
  style,
}) => {
  const renderIcon = useCallback(() => {
    const iconClassName = 'w-7 h-7 rounded-md';

    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt={`${displayName} icon`}
          className={iconClassName}
        />
      );
    }

    if (IconComponent) {
      return <IconComponent className={iconClassName} />;
    }

    return null;
  }, [IconComponent, iconSrc, displayName]);

  return (
    <Button
      className={cn('px-3 py-3 h-auto justify-start', className)}
      disabled={disabled || loading}
      loading={loading}
      style={style}
      variant="outline"
      onClick={onClick}
      data-testid={`external-wallet-${groupKey}${chain ? `-${chain}` : ''}`}
    >
      <div className="flex items-center gap-3">
        {renderIcon()}

        <div className="flex-1 justify-items-start">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
        </div>

        {chainIcons.length > 0 && (
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            {chainIcons.map((icon) => (
              <icon.component
                key={icon.key}
                className="w-4 h-4 not-first:-ml-3 bg-muted rounded-lg"
              />
            ))}
          </div>
        )}
      </div>
    </Button>
  );
};
