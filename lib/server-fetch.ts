export interface ServerFetchOptions extends Omit<RequestInit, 'body'> {
  tags?: string[];
  revalidate?: number;
  body?: any;
  timeoutMs?: number;
}

export async function serverFetch<T>(endpoint: string, options?: ServerFetchOptions): Promise<T> {
  // During static build, if no real API URL is configured, bail out immediately
  // so the build doesn't hang waiting for a non-existent server.
  let apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (!apiUrl) {
    // Return null-ish so pages can gracefully skip SSG data
    return undefined as unknown as T;
  }
  if (!apiUrl.endsWith('/api/v1')) {
    apiUrl = `${apiUrl}/api/v1`;
  }

  // Ensure endpoint starts with a slash and avoid duplicate /api/v1 prefix
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
  }
  let url = `${apiUrl}${cleanEndpoint}`;

  // Append a hardcoded cache buster to completely bypass the stale Next.js fetch cache key
  const cacheBuster = "cb=20260824v3";
  url = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;

  // Build-safe timeout: 12 seconds. Prevents the build worker being killed after 60s.
  const timeoutMs = options?.timeoutMs ?? 12_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  // Stringify body if it's an object and not already a string
  if (options?.body && typeof options.body !== 'string') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Handle Next.js cache options
  if (options?.tags || options?.revalidate !== undefined) {
    const defaultTags = options?.tags || [];
    fetchOptions.next = {
      tags: [...defaultTags, 'v2-cache'],
      ...(options.revalidate !== undefined && { revalidate: options.revalidate }),
    };
  }

  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timer);

    if (!res.ok) {
      // Try to parse error message if possible
      let errorMsg = `ServerFetch Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        // Ignore json parse error for non-json error responses
      }
      throw new Error(errorMsg);
    }

    // Check if response is empty (e.g. 204 No Content)
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return null as any;
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(timer);
    if (error?.name === 'AbortError') {
      console.warn(`[serverFetch] Timed out after ${timeoutMs}ms: ${url}`);
      return undefined as unknown as T;
    }
    console.error(`[serverFetch] Failed to fetch ${url}:`, error);
    return undefined as unknown as T;
  }
}
