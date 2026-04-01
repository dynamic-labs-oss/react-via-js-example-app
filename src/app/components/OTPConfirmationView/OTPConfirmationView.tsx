import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { ErrorMessage } from '../ErrorMessage';

const OTP_LENGTH = 6;

type OTPConfirmationViewProps = {
  onCancel: () => void;
  onSubmit: (otp: string) => Promise<void>;
};

export const OTPConfirmationView: FC<OTPConfirmationViewProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && digits.every((d) => d !== '');

  const {
    mutate: handleOtpSubmit,
    isPending,
    error,
    reset,
  } = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      return onSubmit(otp);
    },
  });

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const updateDigits = useCallback(
    (nextDigits: string[]) => {
      setDigits(nextDigits);
      reset();
    },
    [reset]
  );

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = digit;
    updateDigits(nextDigits);

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        updateDigits(nextDigits);
      } else if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        updateDigits(nextDigits);
        focusInput(index - 1);
      }
      e.preventDefault();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      e.preventDefault();
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      nextDigits[i] = pasted[i] ?? '';
    }
    updateDigits(nextDigits);

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    focusInput(lastIndex);
  };

  return (
    <form className="space-y-6" onSubmit={handleOtpSubmit}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground">
          Enter OTP
        </label>

        <div className="flex justify-center gap-3" data-testid="otp-input">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              autoFocus={index === 0}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={cn(
                'w-12 h-14 rounded-lg border text-center text-xl font-semibold tabular-nums',
                'bg-transparent shadow-xs outline-none transition-all',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'placeholder:text-muted-foreground/30',
                error
                  ? 'border-destructive ring-destructive/20'
                  : 'border-input'
              )}
            />
          ))}
        </div>

        {/* Hidden input for form validation */}
        <input type="hidden" name="otp" value={otp} required />

        <div className="relative">
          <ErrorMessage error={error} />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        data-testid="submit-otp-button"
        disabled={isPending || !isComplete}
        loading={isPending}
      >
        Submit
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
        className="w-full"
        disabled={isPending}
      >
        Back
      </Button>
    </form>
  );
};
