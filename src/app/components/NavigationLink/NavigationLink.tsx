import type { FC, PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '../../../utils/cn';

type NavigationLinkProps = PropsWithChildren<{
  'data-testid'?: string;
  disabled?: boolean;
  navigateTo: string;
  onClick?: () => void;
}>;

export const NavigationLink: FC<NavigationLinkProps> = ({
  children,
  disabled,
  navigateTo,
  'data-testid': dataTestId,
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === navigateTo;

  return (
    <Link
      to={navigateTo}
      className={cn(disabled && 'pointer-events-none opacity-30')}
      onClick={onClick}
    >
      <button
        disabled={disabled}
        data-testid={dataTestId}
        className={cn(
          'flex items-center w-full px-3 py-2 rounded-lg text-[13px] font-medium gap-3 transition-colors relative cursor-pointer',
          isActive
            ? 'bg-sidebar-primary/15 text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground/90 hover:bg-sidebar-accent'
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-sidebar-primary" />
        )}
        {children}
      </button>
    </Link>
  );
};
