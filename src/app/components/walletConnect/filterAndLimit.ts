export const MAX_WALLETS_DISPLAY = 10;

type FilterAndLimitParams<T> = {
  getSearchableTexts: (item: T) => string[];
  items: T[];
  searchQuery: string;
};

/**
 * Filters and limits items based on a search query.
 * If no search query is provided, returns the first MAX_WALLETS_DISPLAY items.
 * Otherwise, filters items where any searchable text matches the query (case-insensitive),
 * then returns up to MAX_WALLETS_DISPLAY items.
 */
export const filterAndLimit = <T>({
  items,
  searchQuery,
  getSearchableTexts,
}: FilterAndLimitParams<T>): T[] => {
  if (!searchQuery.trim()) {
    return items.slice(0, MAX_WALLETS_DISPLAY);
  }

  const query = searchQuery.toLowerCase().trim();

  const filtered = items.filter((item) => {
    const searchableTexts = getSearchableTexts(item);

    return searchableTexts.some((text) => text.toLowerCase().includes(query));
  });

  return filtered.slice(0, MAX_WALLETS_DISPLAY);
};
