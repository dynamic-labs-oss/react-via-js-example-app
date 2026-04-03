type AddressValidation = {
  hint: string;
  isValid: boolean;
  placeholder: string;
};

const chainPatterns: Record<
  string,
  { hint: string; pattern: RegExp; placeholder: string }
> = {
  APTOS: {
    hint: 'Must start with 0x followed by 1-64 hex characters',
    pattern: /^0x[a-fA-F0-9]{1,64}$/,
    placeholder: '0x...',
  },
  BTC: {
    hint: 'Must be a valid Bitcoin address (bc1..., 1..., or 3...)',
    pattern: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    placeholder: 'bc1q...',
  },
  EVM: {
    hint: 'Must start with 0x followed by 40 hex characters',
    pattern: /^0x[a-fA-F0-9]{40}$/,
    placeholder: '0x...',
  },
  SOL: {
    hint: 'Must be a valid Solana base58 address (32-44 characters)',
    pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    placeholder: 'Base58 address',
  },
  STARK: {
    hint: 'Must start with 0x followed by 1-64 hex characters',
    pattern: /^0x[a-fA-F0-9]{1,64}$/,
    placeholder: '0x...',
  },
  SUI: {
    hint: 'Must start with 0x followed by 64 hex characters',
    pattern: /^0x[a-fA-F0-9]{64}$/,
    placeholder: '0x...',
  },
  TON: {
    hint: 'Must be a valid TON address (UQ..., EQ..., kQ..., or 0Q... format)',
    pattern: /^(UQ|EQ|kQ|0Q)[A-Za-z0-9_-]{46}$|^0:[0-9a-fA-F]{64}$/,
    placeholder: 'UQ...',
  },
  TRON: {
    hint: 'Must start with T followed by 33 alphanumeric characters',
    pattern: /^T[a-zA-HJ-NP-Z0-9]{33}$/,
    placeholder: 'T...',
  },
};

export const validateAddress = (
  chain: string,
  address: string
): AddressValidation => {
  const config = chainPatterns[chain];

  if (!config) {
    return {
      hint: '',
      isValid: address.length > 0,
      placeholder: 'Enter recipient address',
    };
  }

  return {
    hint: config.hint,
    isValid: config.pattern.test(address),
    placeholder: config.placeholder,
  };
};

export const getAddressPlaceholder = (chain: string): string =>
  chainPatterns[chain]?.placeholder ?? 'Enter recipient address';
