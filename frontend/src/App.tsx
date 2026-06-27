import { useState, useCallback, useRef } from 'react';
import type { QueryResult } from './types';
import { docuqueryApi, ApiError } from './api/docuquery';
import { useHealth } from './hooks/useHealth';
import { useDocuments } from './hooks/useDocuments';
import { Header } from './components/Header';
import { IngestPanel } from './components/IngestPanel';
import { DocumentList } from './components/DocumentList';
import { QueryInterface } from './components/QueryInterface';
import { AnswerDisplay } from './components/AnswerDisplay';
import type { IngestResponse } from './types';

export default function App() {
  const { status, detail } = useHealth();
  const { documents, loading: docsLoading, error: docsError, refresh, remove } = useDocuments();

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryAbortRef = useRef<AbortController | null>(null);

  const handleIngestSuccess = useCallback(
    (_result: IngestResponse) => {
      void refresh();
    },
    [refresh],
  );

  const handleQuery = useCallback(async (question: string) => {
    queryAbortRef.current?.abort();
    queryAbortRef.current = new AbortController();

    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);

    const start = Date.now();
    try {
      const response = await docuqueryApi.query({ question }, queryAbortRef.current.signal);
      setQueryResult({ response, latencyMs: Date.now() - start });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setQueryError(
        e instanceof ApiError ? e.message : 'Query failed. Check that the backend is running.',
      );
    } finally {
      setQueryLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header status={status} detail={detail} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Backend offline warning */}
        {status === 'offline' && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in"
          >
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Backend unreachable</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Make sure the DocuQuery Spring Boot API is running on{' '}
                <code className="font-mono text-xs bg-amber-100 rounded px-1 py-0.5">localhost:8080</code>.
                Run <code className="font-mono text-xs bg-amber-100 rounded px-1 py-0.5">docker compose up</code> to start all services.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
          {/* Left column: ingestion + document library */}
          <div className="space-y-6">
            <IngestPanel onSuccess={handleIngestSuccess} />
            <DocumentList
              documents={documents}
              loading={docsLoading}
              error={docsError}
              onDelete={remove}
              onRefresh={refresh}
            />
          </div>

          {/* Right column: query + answer */}
          <div className="space-y-6">
            <QueryInterface loading={queryLoading} onSubmit={handleQuery} />
            <AnswerDisplay
              result={queryResult}
              loading={queryLoading}
              error={queryError}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-400">
          <span>DocuQuery · RAG-powered document intelligence</span>
          <span>Spring Boot · ChromaDB · OpenAI · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
