import { useState, useCallback, useRef, useEffect } from 'react';
import type { IngestResponse, QueryResult } from './types';
import { docuqueryApi, ApiError } from './api/docuquery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IngestPanel } from './components/IngestPanel';
import { QueryInterface } from './components/QueryInterface';
import { AnswerDisplay } from './components/AnswerDisplay';

function StepLabel({ n, title, active }: { n: number; title: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={[
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
          active ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500',
        ].join(' ')}
      >
        {n}
      </span>
      <h2 className={['text-sm font-semibold tracking-tight', active ? 'text-slate-900' : 'text-slate-400'].join(' ')}>
        {title}
      </h2>
    </div>
  );
}

export default function App() {
  const [activeDoc, setActiveDoc] = useState<IngestResponse | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryAbortRef = useRef<AbortController | null>(null);
  const askSectionRef = useRef<HTMLDivElement>(null);

  const hasIngested = activeDoc !== null;

  // Reveal: after ingestion, bring the query section into view and focus it.
  useEffect(() => {
    if (!activeDoc) return;
    askSectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
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

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-brand-50/40">
      {/* Soft decorative background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="absolute top-40 -right-24 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <Header />

      <main className="relative flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <Hero />

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          {/* Step 1 — Add document */}
          <section>
            <StepLabel n={1} title="Add document" active={!hasIngested} />
            <IngestPanel onSuccess={handleIngestSuccess} />
          </section>

          {/* Step 2 — Ask questions */}
          <section ref={askSectionRef} className="scroll-mt-24">
            <StepLabel n={2} title="Ask questions" active={hasIngested} />
            {hasIngested ? (
              <div className="space-y-5 animate-slide-up">
                {activeDoc && !queryResult && !queryError && !queryLoading && (
                  <div
                    role="status"
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="text-sm font-semibold text-emerald-900">
                      {activeDoc.title} is ready — ask your first question.
                    </p>
                  </div>
                )}
                <QueryInterface
                  loading={queryLoading}
                  onSubmit={handleQuery}
                  activeDocTitle={activeDoc?.title}
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-500">Add a document to begin</p>
                <p className="text-sm text-slate-400 mt-1">
                  Once ingested, ask questions and explore topics here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="relative border-t border-slate-200/70 bg-white/60 backdrop-blur py-4 mt-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          DocuQuery · source-grounded answers from your documentation
        </div>
      </footer>
    </div>
  );
}
