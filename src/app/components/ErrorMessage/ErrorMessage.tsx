import type { FC } from 'react';

import type { ClassStyleProps } from '../../../types/ClassStyleProps';
import { cn } from '../../../utils/cn';
import { getErrorMessage } from '../../functions/getErrorMessage';

type ErrorMessageProps = ClassStyleProps & {
  defaultMessage?: string;
  error: unknown;
};

export const ErrorMessage: FC<ErrorMessageProps> = ({
  error,
  defaultMessage,
  className,
  style,
}) => {
  if (!error) {
    return null;
  }

  const errorMessage = getErrorMessage({ defaultMessage, error });

  return (
    <p
      className={cn(
        'text-sm text-destructive text-center font-medium wrap-anywhere',
        className
      )}
      data-testid="error-message"
      style={style}
    >
      {errorMessage}
    </p>
  );
};
