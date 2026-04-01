import {
  Content,
  Group,
  Item,
  Portal,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleDotIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

const DropdownMenu = ({ ...props }: ComponentProps<typeof Root>) => {
  return <Root data-slot="dropdown-menu" {...props} />;
};

const DropdownMenuTrigger = ({ ...props }: ComponentProps<typeof Trigger>) => {
  return <Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof Content>) => {
  return (
    <Portal>
      <Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
          className
        )}
        {...props}
      />
    </Portal>
  );
};

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof Item> & {
  inset?: boolean;
}) => {
  return (
    <Item
      data-slot="dropdown-menu-item"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked: _checked,
  ...props
}: ComponentProps<typeof Item> & {
  checked?: boolean;
}) => {
  return (
    <Item
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <CheckIcon className="h-4 w-4" />
      </span>
      {children}
    </Item>
  );
};

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Item>) => {
  return (
    <Item
      data-slot="dropdown-menu-radio-item"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <CircleDotIcon className="h-2 w-2 fill-current" />
      </span>
      {children}
    </Item>
  );
};

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<'div'> & {
  inset?: boolean;
}) => {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof Separator>) => {
  return (
    <Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
};

const DropdownMenuShortcut = ({
  className,
  ...props
}: ComponentProps<'span'>) => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};

const DropdownMenuSub = ({ ...props }: ComponentProps<typeof Sub>) => {
  return <Sub data-slot="dropdown-menu-sub" {...props} />;
};

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof SubTrigger> & {
  inset?: boolean;
}) => {
  return (
    <SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        'focus:bg-accent data-[state=open]:bg-accent focus:text-accent-foreground data-[state=open]:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </SubTrigger>
  );
};

const DropdownMenuSubContent = ({
  className,
  ...props
}: ComponentProps<typeof SubContent>) => {
  return (
    <SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg',
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuGroup = ({ ...props }: ComponentProps<typeof Group>) => {
  return <Group data-slot="dropdown-menu-group" {...props} />;
};

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
