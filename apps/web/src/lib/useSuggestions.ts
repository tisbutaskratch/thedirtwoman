import { useEffect, useState } from "react";

/**
 * Past entries for one field, fetched once and shared.
 *
 * These back a native <datalist>, so the browser handles the dropdown,
 * the keyboard and the screen reader announcement. That is worth more than
 * a custom combobox here: it is one element, it behaves the way the phone
 * keyboard expects, and typing something new is never blocked by the list.
 *
 * The cache is per field for the life of the page. Suggestions come from
 * trips you have already planned, so they do not change while you are in
 * the middle of adding something, and refetching on every mount would be a
 * request per section for a list that is nearly always identical.
 */
const cache = new Map<string, Promise<string[]>>();

export function useSuggestions(key: string, fetcher: () => Promise<string[]>): string[] {
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    if (!cache.has(key)) {
      // A failed lookup should never break the form it is decorating, so a
      // rejection becomes an empty list rather than an unhandled promise.
      cache.set(
        key,
        fetcher().catch(() => []),
      );
    }
    cache
      .get(key)!
      .then((list) => {
        if (active) setValues(list);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [key, fetcher]);

  return values;
}

/** Clears the cache. Used by tests, and after anything that invalidates it. */
export function resetSuggestionCache() {
  cache.clear();
}
