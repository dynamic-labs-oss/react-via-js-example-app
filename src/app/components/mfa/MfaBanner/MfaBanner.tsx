import { ChevronDown, Shield } from 'lucide-react';
import { type FC, useState } from 'react';

import { cn } from '../../../../utils/cn';
import { dynamicClient } from '../../../constants/dynamicClient';
import { useUser } from '../../../hooks/useUser';

const StatusBadge: FC<{
  disabledText?: string;
  enabledText?: string;
  isEnabled: boolean;
}> = ({ isEnabled, enabledText = 'Enabled', disabledText = 'Disabled' }) => {
  return (
    <span
      className={cn(
        'text-[11px] font-medium px-1.5 py-0.5 rounded',
        isEnabled
          ? 'bg-emerald-500/10 text-emerald-600'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isEnabled ? enabledText : disabledText}
    </span>
  );
};

export const MfaBanner: FC = () => {
  const [showMore, setShowMore] = useState(false);
  const user = useUser();

  const userHasMfaToken = !!dynamicClient.mfaToken;
  const mfaSettings = dynamicClient.projectSettings?.security.mfa;
  const isSessionMfaEnabled = mfaSettings?.enabled;
  const isSessionMfaRequired = mfaSettings?.required;
  const isActionMfaEnabled = mfaSettings?.actions?.some(
    (action) => action.required
  );
  const mfaMethods = mfaSettings?.methods;
  const isMfaSessionActive =
    isSessionMfaEnabled && !user?.scope?.includes('requiresAdditionalAuth');

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card">
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors rounded-2xl"
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            isMfaSessionActive ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          )}
        >
          <Shield
            className={cn(
              'w-4 h-4',
              isMfaSessionActive ? 'text-emerald-600' : 'text-amber-600'
            )}
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground">
            {isMfaSessionActive
              ? 'MFA session active'
              : 'No MFA session active'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusBadge
              isEnabled={!!isSessionMfaRequired}
              enabledText="Required"
              disabledText="Optional"
            />
            {isActionMfaEnabled && (
              <StatusBadge
                isEnabled={!!userHasMfaToken}
                enabledText="MFA Token"
                disabledText="No MFA Token"
              />
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground/40 transition-transform',
            showMore && 'rotate-180'
          )}
        />
      </button>

      {showMore && (
        <div className="px-5 pb-4 border-t border-border/40">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Enforcement
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground">Session Based</span>
                  <StatusBadge isEnabled={!!isSessionMfaEnabled} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground">Action Based</span>
                  <StatusBadge isEnabled={!!isActionMfaEnabled} />
                </div>
              </div>

              {mfaSettings?.actions && mfaSettings.actions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </p>
                  {mfaSettings.actions.map((action) => (
                    <div
                      key={action.action}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs text-foreground">
                        {action.action.charAt(0).toUpperCase() +
                          action.action.slice(1)}
                      </span>
                      <StatusBadge
                        isEnabled={action.required}
                        enabledText="Required"
                        disabledText="Not Required"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Methods
              </p>
              <div className="space-y-2">
                {mfaMethods?.map((method) => (
                  <div key={method.type} className="flex items-center gap-2">
                    <span className="text-xs text-foreground">
                      {method.type.charAt(0).toUpperCase() +
                        method.type.slice(1)}
                    </span>
                    <StatusBadge isEnabled={method.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
