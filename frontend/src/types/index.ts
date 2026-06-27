export interface HealthResponse {
  status: 'UP' | 'DEGRADED';
  postgres: 'UP' | 'DOWN';
  chromadb: 'UP' | 'DOWN';
}

export interface IngestRequest {
  title: string;
  content: string;
}

export interface IngestResponse {
  documentId: number;
  title: string;
  chunksCreated: number;
}

export interface DocumentRecord {
  id: number;
  title: string;
  filename: string | null;
  chunkCount: number;
  createdAt: string;
}

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  answer: string;
  sourcesUsed: number;
  question: string;
}

export type BackendStatus = 'checking' | 'online' | 'degraded' | 'offline';

export interface QueryResult {
  response: QueryResponse;
  latencyMs: number;
}
