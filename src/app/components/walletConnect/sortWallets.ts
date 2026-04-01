export const PRIORITY_WALLET_KEYS = [
  'metamask',
  'coinbase',
  'phantom',
  'magiceden',
  'trust',
  'okxwallet',
  'rainbow',
  'argentx',
  'backpack',
  'xverse',
  'onekey',
  'solflare',
  'braavos',
  'brave',
  'unisat',
  'bitgetwallet',
  'coin98',
  'glow',
  'flowwalletflow',
];

type SortableItem = {
  id?: string;
  name: string;
};

const getPriorityIndex = (
  item: SortableItem,
  priorityList: string[]
): number => {
  const identifier = item.id ? item.id.toLowerCase() : item.name.toLowerCase();

  return priorityList.indexOf(identifier);
};

const compareByPriority = (
  a: SortableItem,
  b: SortableItem,
  priorityList: string[]
): number => {
  const aIndex = getPriorityIndex(a, priorityList);
  const bIndex = getPriorityIndex(b, priorityList);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  }

  if (aIndex !== -1) {
    return -1;
  }

  if (bIndex !== -1) {
    return 1;
  }

  return a.name.localeCompare(b.name);
};

/**
 * Sorts wallets by priority, with priority wallets appearing first,
 * followed by other wallets sorted alphabetically.
 */
export const sortWallets = <T extends SortableItem>(wallets: T[]): T[] => {
  return [...wallets].sort((a, b) =>
    compareByPriority(a, b, PRIORITY_WALLET_KEYS)
  );
};
