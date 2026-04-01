type GetErrorMessageParams = {
  defaultMessage?: string;
  error: unknown;
};

const EMAIL_FORMAT_ERROR_MESSAGE_PREFIX =
  'request/body/email must match format' as const;

export const getErrorMessage = ({
  error,
  defaultMessage,
}: GetErrorMessageParams) => {
  if (!error) {
    return '';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    if (error.message.includes(EMAIL_FORMAT_ERROR_MESSAGE_PREFIX)) {
      return 'Invalid email';
    }

    return error.message;
  }

  return defaultMessage ?? 'Something went wrong. Please try again.';
};
