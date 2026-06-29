import type { ApiConnection } from "@/types";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  duration?: number;
}

interface RequestOptions {
  method?: ApiConnection["method"];
  body?: unknown;
  customHeaders?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
}

// ─── Build auth headers ───────────────────────────────────────────────────────

function buildAuthHeaders(connection: ApiConnection): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (connection.authType === "bearer" && connection.bearerToken) {
    headers["Authorization"] = `Bearer ${connection.bearerToken}`;
  } else if (connection.authType === "api_key" && connection.apiKey) {
    const headerName = connection.apiKeyHeader ?? "X-API-Key";
    headers[headerName] = connection.apiKey;
  }

  Object.entries(connection.customHeaders ?? {}).forEach(([k, v]) => {
    headers[k] = v;
  });

  return headers;
}

// ─── Execute API request with retry ──────────────────────────────────────────

async function executeRequest<T = unknown>(
  url: string,
  headers: Record<string, string>,
  options: RequestOptions,
  attempt = 1
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const timeout = options.timeout ?? 30000;
  const maxRetries = options.retryCount ?? 3;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!res.ok) {
      // Retry on 5xx
      if (res.status >= 500 && attempt < maxRetries) {
        await sleep(attempt * 1000);
        return executeRequest<T>(url, headers, options, attempt + 1);
      }
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}`, statusCode: res.status, duration };
    }

    const data = (await res.json()) as T;
    return { success: true, data, statusCode: res.status, duration };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Request failed";
    if (msg.includes("abort") || msg.includes("timeout")) {
      return { success: false, error: "Request timed out", duration: timeout };
    }
    if (attempt < maxRetries) {
      await sleep(attempt * 1000);
      return executeRequest<T>(url, headers, options, attempt + 1);
    }
    return { success: false, error: msg, duration: Date.now() - startTime };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function testConnection(connection: ApiConnection): Promise<ApiResponse> {
  const url = `${connection.baseUrl.replace(/\/$/, "")}${connection.endpoint}`;
  const headers = buildAuthHeaders(connection);
  return executeRequest(url, headers, {
    method: "GET",
    timeout: connection.timeout ?? 10000,
    retryCount: 1,
  });
}

export async function fetchFromApi<T = unknown>(
  connection: ApiConnection,
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${connection.baseUrl.replace(/\/$/, "")}${endpoint}`;
  const headers = buildAuthHeaders(connection);
  return executeRequest<T>(url, headers, {
    ...options,
    timeout: connection.timeout ?? 30000,
    retryCount: connection.retryCount ?? 3,
  });
}

export async function fetchPaginated<T = unknown>(
  connection: ApiConnection,
  endpoint: string,
  dataKey: string,
  maxPages = 10
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;

  while (page <= maxPages) {
    const pageParam = connection.pageParam ?? "page";
    const pageSizeParam = connection.pageSizeParam ?? "per_page";
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${endpoint}${sep}${pageParam}=${page}&${pageSizeParam}=${connection.pageSize ?? 50}`;

    const res = await fetchFromApi<Record<string, unknown>>(connection, url);
    if (!res.success || !res.data) break;

    const items = (res.data[dataKey] as T[]) ?? [];
    if (!Array.isArray(items) || items.length === 0) break;

    allItems.push(...items);
    if (items.length < (connection.pageSize ?? 50)) break;
    page++;
  }

  return allItems;
}
