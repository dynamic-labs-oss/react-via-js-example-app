import type { UserPasskey } from '@dynamic-labs-sdk/client';
import { CopyIcon, KeyIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PasskeyCardProps {
  onDelete?: (passkeyId: string) => void;
  passkey: UserPasskey;
}

export const PasskeyCard: FC<PasskeyCardProps> = ({ passkey, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCredentialId = async () => {
    await navigator.clipboard.writeText(passkey.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(passkey.id);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getDeviceInfo = () => {
    if (passkey.userAgent) {
      if (passkey.userAgent.includes('Chrome')) return 'Chrome';
      if (passkey.userAgent.includes('Firefox')) return 'Firefox';
      if (passkey.userAgent.includes('Safari')) return 'Safari';
      if (passkey.userAgent.includes('Edge')) return 'Edge';
      return 'Browser';
    }
    return 'Unknown Device';
  };

  return (
    <div className="px-4 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.06]">
          <KeyIcon className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {passkey.alias || 'Unnamed Passkey'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{getDeviceInfo()}</span>
            <span className="text-border">·</span>
            <span>{formatDate(passkey.createdAt)}</span>
            {passkey.origin && (
              <>
                <span className="text-border">·</span>
                <span className="truncate">{passkey.origin}</span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
            >
              <MoreHorizontalIcon className="w-3.5 h-3.5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyCredentialId}>
              <CopyIcon className="w-3.5 h-3.5 mr-2" />
              {copied ? 'Copied!' : 'Copy Credential ID'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive focus:bg-destructive/5"
            >
              <TrashIcon className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-1.5 ml-11 text-[11px] text-muted-foreground/60 font-mono truncate">
        {passkey.id}
      </p>
    </div>
  );
};
