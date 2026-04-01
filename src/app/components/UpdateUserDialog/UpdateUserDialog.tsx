import {
  type OTPVerification,
  sendEmailOTP,
  sendSmsOTP,
  updateUser,
  verifyOTP,
} from '@dynamic-labs-sdk/client';
import { useMutation } from '@tanstack/react-query';
import { Pencil, ShieldCheck } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser } from '../../hooks/useUser';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { OTPConfirmationView } from '../OTPConfirmationView/OTPConfirmationView';

const userFields = [
  {
    canVerify: false,
    label: 'Alias',
    name: 'alias',
    type: 'text',
  },
  {
    canVerify: true,
    label: 'Email',
    name: 'email',
    type: 'email',
  },
  {
    canVerify: true,
    label: 'Phone Number',
    name: 'phoneNumber',
    type: 'tel',
  },
  {
    canVerify: false,
    label: 'First Name',
    name: 'firstName',
    type: 'text',
  },
  {
    canVerify: false,
    label: 'Last Name',
    name: 'lastName',
    type: 'text',
  },
  {
    canVerify: false,
    label: 'Username',
    name: 'username',
    type: 'text',
  },
] as const;

type UserFieldName = (typeof userFields)[number]['name'];

type UpdateUserFormState = Record<UserFieldName, string>;

const createEmptyForm = (): UpdateUserFormState =>
  userFields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: '',
    }),
    {} as UpdateUserFormState
  );

const createFormFromUser = (
  user: ReturnType<typeof useUser>
): UpdateUserFormState =>
  userFields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]:
        (user?.[field.name as keyof typeof user] as string | undefined) || '',
    }),
    {} as UpdateUserFormState
  );

export const UpdateUserDialog: FC = () => {
  const user = useUser();

  const [isOpen, _setIsOpen] = useState(false);
  const [otpState, setOtpState] = useState<OTPVerification | null>(null);
  const [form, setForm] = useState<UpdateUserFormState>(createEmptyForm());

  const {
    mutateAsync: submitUpdateUser,
    isPending: isUpdatingUser,
    error: updateUserError,
    reset: resetUpdateUserError,
  } = useMutation({
    mutationFn: async (userFieldsToUpdate: Partial<UpdateUserFormState>) => {
      const filteredFormEntries = Object.entries(userFieldsToUpdate).filter(
        ([key, value]) =>
          value !== undefined &&
          value !== '' &&
          user?.[key as keyof typeof user] !== value
      );

      if (filteredFormEntries.length === 0) {
        return;
      }

      const filteredForm = Object.fromEntries(
        filteredFormEntries
      ) as UpdateUserFormState;

      const otpVerification = await updateUser({ userFields: filteredForm });

      if (otpVerification) {
        setOtpState(otpVerification);
        return;
      }

      setIsOpen(false);
    },
  });

  const setIsOpen = (isOpen: boolean) => {
    _setIsOpen(isOpen);

    if (isOpen && user) {
      setForm(createFormFromUser(user));
      setOtpState(null);
      resetUpdateUserError();
    }

    if (!isOpen) {
      setForm(createEmptyForm());
      setOtpState(null);
      resetUpdateUserError();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetUpdateUserError();

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateUser = async () => {
    try {
      await submitUpdateUser(form);
    } catch {
      return;
    }
  };

  const handleReverify = async (fieldName: UserFieldName) => {
    const value = form[fieldName];

    if (!value) {
      return;
    }

    let otpVerification: OTPVerification | undefined;

    if (fieldName === 'email') {
      otpVerification = await sendEmailOTP({ email: value });
    } else if (fieldName === 'phoneNumber') {
      otpVerification = await sendSmsOTP({
        isoCountryCode: 'US',
        phoneNumber: value,
      });
    }

    if (otpVerification) {
      setOtpState(otpVerification);
    }
  };

  const handleCloseOtp = () => {
    setOtpState(null);
  };

  const handleSubmitOtp = async (otp: string) => {
    if (!otpState) {
      return;
    }

    await verifyOTP({
      otpVerification: otpState,
      verificationToken: otp,
    });

    setOtpState(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-3 h-3" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Update User</DialogTitle>
        {otpState ? (
          <OTPConfirmationView
            onSubmit={handleSubmitOtp}
            onCancel={handleCloseOtp}
          />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {userFields.map((field) => {
                const value = form[field.name];
                const canReverify =
                  field.canVerify && !!value && value === user?.[field.name];

                return (
                  <div key={field.name} className="flex gap-2">
                    <Input
                      name={field.name}
                      placeholder={field.label}
                      type={field.type}
                      value={value}
                      onChange={handleChange}
                    />
                    {canReverify && (
                      <div className="relative group">
                        <Button
                          variant="outline"
                          onClick={() => handleReverify(field.name)}
                          disabled={isUpdatingUser}
                        >
                          <ShieldCheck />
                        </Button>
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-popover text-popover-foreground border border-border text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-md">
                          Re-verify with OTP
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <ErrorMessage error={updateUserError} />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={isUpdatingUser}
              >
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
