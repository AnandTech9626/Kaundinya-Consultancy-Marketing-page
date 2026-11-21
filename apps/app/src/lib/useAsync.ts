import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeLiveData } from "./live";

export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Minimal async data hook with live revalidation.
 *
 * It re-runs the fetcher whenever a notification arrives (SSE) and when the
 * tab becomes visible again, so admin-side status changes reach the client
 * without a manual reload.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
): AsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const run = useCallback(() => {
    let cancelled = false;
    if (!loadedOnce.current) setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (!cancelled) {
          loadedOnce.current = true;
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  useEffect(() => {
    const unsubscribe = subscribeLiveData(run);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, 120_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [run]);

  return { data, loading, error, refetch: run };
}

/** Re-runs a manual loader on live events and when the tab regains focus. */
export function useLiveRefetch(refetch: () => void) {
  useEffect(() => {
    const unsubscribe = subscribeLiveData(refetch);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refetch();
    }, 120_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);
}
