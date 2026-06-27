import { useState, useCallback, useRef, useEffect } from 'react';
import type { IngestResponse, QueryResult } from './types';
import { docuqueryApi, ApiError } from './api/docuquery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ModeTabs, type Mode } from './components/ModeTabs';
import { IngestPanel } from './components/IngestPanel';
import { QueryInterface } from './components/QueryInterface';
import { AnswerDisplay } from './components/AnswerDisplay';

export default function App() {
  // Has any document been ingested this session? Unlocks the "Ask" mode for good.
  const [hasIngested, setHasIngested] = useState(false);
  const [activeDoc, setActiveDoc] = useState<IngestResponse | null>(null);
  const [mode, setMode] = useState<Mode>('upload');
  const [focusSignal, setFocusSignal] = useState(0);

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryAbortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus the question input whenever the user lands on the Ask view.
  useEffect(() => {
    if (mode === 'ask' && hasIngested) setFocusSignal((n) => n + 1);
  }, [mode, hasIngested]);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    contentRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleIngestSuccess = useCallback((result: IngestResponse) => {
    setQueryResult(null);
    setQueryError(null);
    setActiveDoc(result);
    setHasIngested(true);
    setMode('ask'); // reveal questions, but the user can switch back anytime
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

      <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Hero />

        <ModeTabs mode={mode} onChange={switchMode} askLocked={!hasIngested} />

        <div ref={contentRef} className="scroll-mt-24">
          {mode === 'upload' ? (
            <div className="animate-slide-up space-y-4">
              {!hasIngested && (
                <p className="text-center text-sm text-slate-500">
                  Add a document to unlock natural-language questions. ✨
                </p>
              )}
              <IngestPanel onSuccess={handleIngestSuccess} />
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {activeDoc && !queryResult && !queryError && !queryLoading && (
                <div
                  role="status"
                  className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50"
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
                      {activeDoc.chunksCreated} chunk{activeDoc.chunksCreated !== 1 ? 's' : ''} indexed ·
                      questions search your whole knowledge base
                    </p>
                  </div>
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
          )}
        </div>
      </main>

      <footer className="relative border-t border-slate-200/70 bg-white/60 backdrop-blur py-4 mt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          DocuQuery · source-grounded answers from your documentation
        </div>
      </footer>
    </div>
  );
}
