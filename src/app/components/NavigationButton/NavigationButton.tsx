import type { ComponentProps, FC, PropsWithChildren } from 'react';

export const NavigationButton: FC<
  PropsWithChildren<ComponentProps<'button'>>
> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="flex items-center px-3 py-2 text-sidebar-foreground/50 rounded-lg hover:text-sidebar-foreground/80 hover:bg-sidebar-accent group gap-3 w-full text-[13px] font-medium transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
};
