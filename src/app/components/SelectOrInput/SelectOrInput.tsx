import type { SelectValueProps } from '@radix-ui/react-select';
import type { FC } from 'react';
import { useState } from 'react';

import type { InputProps } from '@/components/ui/input';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CUSTOM_OPTION_VALUE = 'other';

type SelectOrInputOption = {
  label: string;
  value: string;
};

type SelectOrInputProps = {
  customInputProps?: InputProps;
  customOptionLabel?: string;
  onChange: (value: string) => void;
  options: SelectOrInputOption[];
  selectValueProps?: SelectValueProps;
};

export const SelectOrInput: FC<SelectOrInputProps> = ({
  onChange,
  options,
  customOptionLabel = 'Other',
  customInputProps,
  selectValueProps,
}) => {
  const [valueSelection, setValueSelection] = useState<string>('');

  const [customValue, setCustomValue] = useState<string>('');

  const hasOptions = options.length > 0;

  const shouldDisplayInput =
    valueSelection === CUSTOM_OPTION_VALUE || !hasOptions;

  const handleSelectChange = (value: string) => {
    setValueSelection(value);
    setCustomValue('');

    if (value === CUSTOM_OPTION_VALUE) {
      onChange('');
    } else {
      onChange(value);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setCustomValue(value);
    onChange(value);
  };

  return (
    <>
      {hasOptions && (
        <Select value={valueSelection} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue {...selectValueProps} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {options.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}

              <SelectItem value={CUSTOM_OPTION_VALUE}>
                {customOptionLabel}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {shouldDisplayInput && (
        <Input
          value={customValue}
          onChange={handleInputChange}
          {...customInputProps}
        />
      )}
    </>
  );
};
