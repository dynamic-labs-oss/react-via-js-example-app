import type { OTPVerification } from '@dynamic-labs-sdk/client';
import { sendEmailOTP, sendSmsOTP } from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import { promptCaptchaIfRequired } from '../../../../store/captcha';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { OTPInput } from './OTPInput';

type SendOTPFormSectionProps = {
  onOtpVerification: (otpVerification: OTPVerification) => void;
};

type HandleSubmitParams = {
  event: React.FormEvent;
  type: 'email' | 'phoneNumber';
};

export const SendOTPFormSection: FC<SendOTPFormSectionProps> = ({
  onOtpVerification,
}) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showEmailSection, setShowEmailSection] = useState(true);

  const { mutate: handleSubmit, error } = useMutation({
    mutationFn: async ({ event, type }: HandleSubmitParams) => {
      event.preventDefault();

      await promptCaptchaIfRequired();

      if (type === 'email') {
        const result = await sendEmailOTP({ email });

        onOtpVerification(result);
      } else {
        const result = await sendSmsOTP({
          isoCountryCode: 'US',
          phoneNumber,
        });

        onOtpVerification(result);
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {showEmailSection ? (
        <OTPInput
          value={email}
          setValue={setEmail}
          handleSubmit={(e) => handleSubmit({ event: e, type: 'email' })}
          label="Email"
          placeholder="Enter your email"
          testId="email-input"
        />
      ) : (
        <OTPInput
          value={phoneNumber}
          setValue={setPhoneNumber}
          handleSubmit={(e) => handleSubmit({ event: e, type: 'phoneNumber' })}
          label="Phone Number"
          placeholder="Enter US/CA phone number"
          testId="phone-number-input"
        />
      )}

      <p
        className="text-xs text-muted-foreground text-center font-medium cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => setShowEmailSection(!showEmailSection)}
        data-testid="toggle-email-phone-number"
      >
        {showEmailSection ? 'Or use a phone number' : 'Or use an email'}
      </p>

      <ErrorMessage
        error={error}
        defaultMessage="Invalid email or phone number"
      />
    </div>
  );
};
