import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

/** The body of an HTTP response, read according to its content type. */
export type ResponseBody =
  | { kind: "none" }
  | { kind: "json"; contentType: string; json: unknown }
  | { kind: "text"; contentType: string; text: string }
  | { kind: "bytes"; contentType: string; bytes: ArrayBuffer };

/** A successful HTTP response and its already-read body. */
export type FetchSuccess = {
  kind: "success";
  response: Response;
  body: ResponseBody;
};

/** A completed HTTP request whose status was outside the 2xx range. */
export type FetchNonSuccess = {
  kind: "non-success";
  response: Response;
  body: ResponseBody;
};

/** The current state of a fetch. `idle` is used before the first request starts. */
export type FetchStatus =
  | { kind: "idle" }
  | { kind: "loading"; stale?: FetchSuccess }
  | { kind: "error"; error: Error; stale?: FetchSuccess }
  | FetchNonSuccess
  | FetchSuccess;

/** Starts the request for `key` and returns its unread HTTP response. */
export type Fetcher = (
  abortSignal: AbortSignal,
  key: string,
) => Promise<Response>;

export type UseFetchResult = {
  status: FetchStatus;
  /** Repeats the request for the current key, cancelling this hook's prior request. */
  refetch: () => void;
};
export type UseFetchOptions = {
  /** Do not start automatically until enabled becomes true. */
  enabled?: boolean;
  /** Keep mutation responses out of the successful-response cache. */
  cacheSuccess?: boolean;
  /** Revalidate a cached response older than this when a consumer mounts. */
  maxAgeMs?: number;
};

type CacheEvent =
  | { kind: "success"; success: FetchSuccess }
  | { kind: "invalidate"; stale?: FetchSuccess };

class FetchCache {
  private readonly successes = new Map<string, FetchSuccess>();
  private readonly savedAt = new Map<string, number>();
  private readonly invalidated = new Set<string>();
  private readonly listeners = new Map<string, Set<(event: CacheEvent) => void>>();

  get(key: string): FetchSuccess | undefined {
    return this.successes.get(key);
  }

  isInvalidated(key: string): boolean {
    return this.invalidated.has(key);
  }

  isFresh(key: string, maxAgeMs: number): boolean {
    return !this.isInvalidated(key) && Date.now() - (this.savedAt.get(key) ?? 0) < maxAgeMs;
  }

  evict(key: string): void {
    this.successes.delete(key);
    this.savedAt.delete(key);
    this.invalidated.delete(key);
  }

  markInvalidated(key: string): void {
    this.invalidated.add(key);
  }

  set(key: string, success: FetchSuccess): void {
    this.successes.set(key, success);
    this.savedAt.set(key, Date.now());
    this.invalidated.delete(key);
    this.emit(key, { kind: "success", success });
  }

  invalidate(key: string): void {
    this.invalidated.add(key);
    this.emit(key, { kind: "invalidate", stale: this.successes.get(key) });
  }

  subscribe(key: string, listener: (event: CacheEvent) => void): () => void {
    const subscribers = this.listeners.get(key) ?? new Set();
    subscribers.add(listener);
    this.listeners.set(key, subscribers);
    return () => {
      subscribers.delete(listener);
      if (subscribers.size === 0) this.listeners.delete(key);
    };
  }

  private emit(key: string, event: CacheEvent): void {
    this.listeners.get(key)?.forEach((listener) => listener(event));
  }
}

const FetchCacheContext = createContext<FetchCache | null>(null);

/** Provides a shared successful-response cache to descendant `useFetch` hooks. */
export function FetchCacheProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [cache] = useState(() => new FetchCache());
  return (
    <FetchCacheContext.Provider value={cache}>
      {children}
    </FetchCacheContext.Provider>
  );
}

/** Invalidates a cache key and refreshes any mounted hook using that key. */
export function useFetchCache(): { invalidate: (key: string) => void; evict: (key: string) => void } {
  const cache = useFetchCacheContext();
  const invalidate = useCallback((key: string) => cache.invalidate(key), [cache]);
  const evict = useCallback((key: string) => cache.evict(key), [cache]);
  return { invalidate, evict };
}

/** Fetches a keyed resource and exposes idle, loading, success, and error states. */
export function useFetch(
  key: string | null,
  fetcher: Fetcher,
  { enabled = true, cacheSuccess = true, maxAgeMs = Infinity }: UseFetchOptions = {},
): UseFetchResult {
  const cache = useFetchCacheContext();
  const [snapshot, setSnapshot] = useState<{ key: string | null; status: FetchStatus }>({
    key: null, status: { kind: "idle" },
  });
  const setStatus = useCallback((status: FetchStatus) => setSnapshot({ key, status }), [key]);
  const fetcherRef = useRef(fetcher);
  const controllerRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef(0);

  fetcherRef.current = fetcher;

  const execute = useCallback(
    async (stale?: FetchSuccess) => {
      if (key === null) return;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const sequence = ++sequenceRef.current;
      const previousSuccess = stale ?? cache.get(key);

      setStatus({
        kind: "loading",
        ...(previousSuccess ? { stale: previousSuccess } : {}),
      });

      try {
        const response = await fetcherRef.current(controller.signal, key);
        const body = await readResponseBody(response);
        if (controller.signal.aborted || sequence !== sequenceRef.current) return;

        if (!response.ok) {
          cache.markInvalidated(key);
          setStatus({ kind: "non-success", response, body });
          return;
        }

        const success: FetchSuccess = { kind: "success", response, body };
        if (cacheSuccess) cache.set(key, success);
        setStatus(success);
      } catch (cause) {
        if (controller.signal.aborted || sequence !== sequenceRef.current) return;
        cache.markInvalidated(key);
        setStatus({
          kind: "error",
          error: toError(cause),
          ...(previousSuccess ? { stale: previousSuccess } : {}),
        });
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [cache, key, cacheSuccess, setStatus],
  );

  useEffect(() => {
    if (!enabled) {
      setStatus({ kind: "idle" });
      return;
    }
    if (key === null) {
      setStatus({ kind: "idle" });
      return;
    }
    const unsubscribe = cache.subscribe(key, (event) => {
      if (event.kind === "success") setStatus(event.success);
      else void execute(event.stale);
    });

    const cached = cache.get(key);
    if (cached && cache.isFresh(key, maxAgeMs)) setStatus(cached);
    else void execute(cached);

    return () => {
      unsubscribe();
      sequenceRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [cache, execute, enabled, key, maxAgeMs, setStatus]);

  const refetch = useCallback(() => {
    if (!enabled || key === null) return;
    void execute(cache.get(key));
  }, [cache, execute, enabled, key]);

  const status: FetchStatus = enabled && key !== null
    ? snapshot.key === key ? snapshot.status : cache.get(key) ?? { kind: "idle" }
    : { kind: "idle" };
  return { status, refetch };
}

function useFetchCacheContext(): FetchCache {
  const cache = useContext(FetchCacheContext);
  if (!cache) {
    throw new Error("useFetch must be used inside a FetchCacheProvider.");
  }
  return cache;
}

async function readResponseBody(response: Response): Promise<ResponseBody> {
  const contentType = response.headers.get("content-type") ?? "";
  const normalizedType = contentType.toLowerCase();

  if (response.body === null || response.status === 204 || response.status === 205) {
    return { kind: "none" };
  }
  if (
    normalizedType.includes("application/json") ||
    normalizedType.includes("+json")
  ) {
    return { kind: "json", contentType, json: await response.json() };
  }
  if (
    normalizedType.startsWith("text/") ||
    normalizedType.includes("application/xml") ||
    normalizedType.includes("+xml")
  ) {
    return { kind: "text", contentType, text: await response.text() };
  }
  return { kind: "bytes", contentType, bytes: await response.arrayBuffer() };
}

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}
