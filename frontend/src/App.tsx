import { useState, useCallback, useRef, useEffect } from 'react';
import type { IngestResponse, QueryResult } from './types';
import { docuqueryApi, ApiError } from './api/docuquery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stepper } from './components/Stepper';
import { IngestPanel } from './components/IngestPanel';
import { QueryInterface } from './components/QueryInterface';
import { QueryLocked } from './components/QueryLocked';
import { AnswerDisplay } from './components/AnswerDisplay';

export default function App() {
  // The document ingested in this session. Drives the two-step workflow.
  const [activeDoc, setActiveDoc] = useState<IngestResponse | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryAbortRef = useRef<AbortController | null>(null);

  const querySectionRef = useRef<HTMLDivElement>(null);

  // Reveal: when a document becomes active, scroll to and focus the query area.
  useEffect(() => {
    if (!activeDoc) return;
    querySectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    setFocusSignal((n) => n + 1);
  }, [activeDoc]);

  const handleIngestSuccess = useCallback((result: IngestResponse) => {
    setQueryResult(null);
    setQueryError(null);
    setActiveDoc(result);
  }, []);

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

  const handleAskAnother = useCallback(() => {
    setQueryResult(null);
    setQueryError(null);
    setFocusSignal((n) => n + 1);
  }, []);

  // Resets the session view only — does not delete anything on the server.
  const handleStartOver = useCallback(() => {
    queryAbortRef.current?.abort();
    setQueryResult(null);
    setQueryError(null);
    setActiveDoc(null);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Hero />

        {/* Progress + start-over */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <Stepper current={activeDoc ? 2 : 1} step1Complete={!!activeDoc} />
          {activeDoc && (
            <button
              type="button"
              onClick={handleStartOver}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-2.5 py-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Use another document
            </button>
          )}
        </div>

        {/* Step 1 — ingestion (primary before a document exists) */}
        {!activeDoc && <IngestPanel onSuccess={handleIngestSuccess} />}

        {/* Success confirmation */}
        {activeDoc && (
          <div
            role="status"
            className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-slide-up"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {activeDoc.title} is ready — ask your first question.
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Embedded into the knowledge base · {activeDoc.chunksCreated} chunk
                {activeDoc.chunksCreated !== 1 ? 's' : ''} indexed
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — query workspace (locked until ingestion succeeds) */}
        <div ref={querySectionRef} className="scroll-mt-20">
          {activeDoc ? (
            <div className="space-y-6 animate-slide-up">
              <QueryInterface
                loading={queryLoading}
                onSubmit={handleQuery}
                activeDocTitle={activeDoc.title}
                focusSignal={focusSignal}
              />
              <AnswerDisplay
                result={queryResult}
                loading={queryLoading}
                error={queryError}
                onAskAnother={handleAskAnother}
              />
            </div>
          ) : (
            <QueryLocked />
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          DocuQuery · source-grounded answers from your documentation
        </div>
      </footer>
    </div>
  );
}
