import type {
  HealthResponse,
  IngestRequest,
  IngestResponse,
  DocumentRecord,
  QueryRequest,
  QueryResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = (await res.json()) as Record<string, unknown>;
      const extracted = body['message'] ?? body['error'];
      if (typeof extracted === 'string') message = extracted;
    } catch {
      // ignore parse errors — keep the default message
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export const docuqueryApi = {
  health(signal?: AbortSignal) {
    return request<HealthResponse>('/api/v1/health', {}, signal);
  },

  ingest(body: IngestRequest, signal?: AbortSignal) {
    return request<IngestResponse>(
      '/api/v1/documents/ingest',
      { method: 'POST', body: JSON.stringify(body) },
      signal,
    );
  },

  listDocuments(signal?: AbortSignal) {
    return request<DocumentRecord[]>('/api/v1/documents', {}, signal);
  },

  deleteDocument(id: number, signal?: AbortSignal) {
    return request<{ status: string; documentId: string }>(
      `/api/v1/documents/${id}`,
      { method: 'DELETE' },
      signal,
    );
  },

  query(body: QueryRequest, signal?: AbortSignal) {
    return request<QueryResponse>(
      '/api/v1/query',
      { method: 'POST', body: JSON.stringify(body) },
      signal,
    );
  },
};
