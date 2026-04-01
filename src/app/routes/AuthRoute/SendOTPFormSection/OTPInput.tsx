import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type EmailSectionProps = {
  handleSubmit: (e: React.FormEvent) => void;
  label: string;
  placeholder: string;
  setValue: (value: string) => void;
  testId: string;
  value: string;
};

export const OTPInput: FC<EmailSectionProps> = ({
  value,
  setValue,
  handleSubmit,
  label,
  placeholder,
  testId,
}) => {
  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${label}-otp`}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>

        <Input
          id={`${label}-otp`}
          name={`${label}-otp`}
          type="text"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          data-testid={testId}
        />
      </div>

      <Button type="submit" data-testid={`${testId}-submit`}>
        Send OTP
      </Button>
    </form>
  );
};
