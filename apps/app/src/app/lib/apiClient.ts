/**
 * Typed API fetch utility.
 * Throws ApiError for non-OK responses so React Query's retry/error
 * handling works correctly.
 */

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type GetAccessToken = () => Promise<string | null>;

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  getAccessToken?: GetAccessToken;
  /** Throw ApiError(401) immediately when no token is available */
  requireAuth?: boolean;
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { getAccessToken, requireAuth = false, headers: extraHeaders = {}, ...fetchOptions } = options;

  let token: string | null = null;
  if (getAccessToken) {
    token = await getAccessToken();
    if (requireAuth && !token) throw new ApiError(401, "Not authenticated");
  }

  const headers: Record<string, string> = {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (fetchOptions.body && typeof fetchOptions.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** Fire-and-forget helper — swallows errors, never throws. */
export function apiFire(path: string, options: ApiFetchOptions = {}): void {
  apiFetch(path, options).catch(() => {});
}

/**
 * Fire-and-forget transaction recording.
 * Call after any on-chain tx confirms. Safe to call multiple times (deduped by tx_hash).
 */
export function recordTransaction(
  token: string | null,
  body: Record<string, unknown>
): void {
  apiFire("/api/v1/transactions/record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

/**
 * Fire-and-forget notification recording for on-chain events.
 * Used for events the backend has no direct visibility into.
 */
export function recordNotification(
  token: string | null,
  body: Record<string, unknown>
): void {
  apiFire("/api/v1/notifications/record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

/** Retry policy: never retry 4xx, retry up to 2x for 5xx/network errors. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < 2;
}
