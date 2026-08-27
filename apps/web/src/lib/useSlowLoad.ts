import { useEffect, useState } from "react";

/**
 * True once a load has been running long enough that it needs explaining.
 *
 * The API sleeps when nobody is using it, and waking it takes the better
 * part of a minute. A spinner that sits there silently for that long reads
 * as broken, which is exactly how it was being read. Past a few seconds we
 * stop implying it is nearly done and say what is actually happening.
 *
 * The threshold is deliberately above a warm response (about a tenth of a
 * second) and well below the cold one, so the notice only ever appears when
 * there is genuinely something to explain.
 */
export function useSlowLoad(loading: boolean, afterMs = 4000): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => clearTimeout(timer);
  }, [loading, afterMs]);

  return slow;
}
