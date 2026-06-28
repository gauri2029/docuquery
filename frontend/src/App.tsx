import { useState, useCallback, useRef, useEffect } from 'react';
import type { DocumentRecord, IngestResponse, QueryResult } from './types';
import { docuqueryApi, ApiError } from './api/docuquery';
import { Header } from './components/Header';
import { IngestPanel } from './components/IngestPanel';
import { QueryInterface } from './components/QueryInterface';
import { AnswerDisplay } from './components/AnswerDisplay';
import { DocumentLibrary } from './components/DocumentLibrary';
import { EvidencePanel } from './components/EvidencePanel';
import { QuestionCard } from './components/QuestionCard';
import { extractCitations } from './lib/citations';

export default function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDoc, setActiveDoc] = useState<IngestResponse | null>(null);
  const [scopeId, setScopeId] = useState<number | 'all'>('all');
  const [focusSignal, setFocusSignal] = useState(0);

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryAbortRef = useRef<AbortController | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [clarifyQuestion, setClarifyQuestion] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [highlightedCite, setHighlightedCite] = useState<number | null>(null);

  // Q&A interaction: the input starts expanded, then collapses to a summary
  // card once a question is asked so the answer becomes the focus.
  const [inputOpen, setInputOpen] = useState(true);
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  const hasDocuments = documents.length > 0 || activeDoc !== null;
  const citations = queryResult ? extractCitations(queryResult.response.answer) : [];

  const loadDocuments = useCallback(async () => {
    try {
      setDocuments(await docuqueryApi.listDocuments());
    } catch {
      // Non-critical: the library falls back to the active document.
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleIngestSuccess = useCallback((result: IngestResponse) => {
    setQueryResult(null);
    setQueryError(null);
    setActiveDoc(result);
    setScopeId(result.documentId); // ask against the document you just added
    setShowAdd(false);
    setAskedQuestion(null);
    setInputOpen(true);
    setFocusSignal((n) => n + 1);
    void loadDocuments();
  }, [loadDocuments]);

  const runQuery = useCallback(async (question: string, docId: number | 'all') => {
    queryAbortRef.current?.abort();
    queryAbortRef.current = new AbortController();

    setClarifyQuestion(null);
    setEvidenceOpen(false);
    setHighlightedCite(null);
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);

    const start = Date.now();
    try {
      const body = docId === 'all' ? { question } : { question, documentId: String(docId) };
      const response = await docuqueryApi.query(body, queryAbortRef.current.signal);
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

  // Ask: collapse the input; if scope is "all" with several docs, clarify first.
  const handleAsk = useCallback((question: string) => {
    setAskedQuestion(question);
    setInputOpen(false);
    if (scopeId === 'all' && documents.length > 1) {
      setClarifyQuestion(question);
      return;
    }
    void runQuery(question, scopeId);
  }, [scopeId, documents.length, runQuery]);

  const handleClarifySelect = useCallback((docId: number | 'all') => {
    setScopeId(docId);
    if (clarifyQuestion) void runQuery(clarifyQuestion, docId);
  }, [clarifyQuestion, runQuery]);

  // Reopen the input (from the minimized question card or "Ask another").
  const reopenInput = useCallback(() => {
    setInputOpen(true);
    setFocusSignal((n) => n + 1);
  }, []);

  const handleTrace = useCallback((n?: number) => {
    setEvidenceOpen(true);
    setHighlightedCite(n ?? null);
  }, []);

  const scopedTitle =
    scopeId === 'all'
      ? 'All documents'
      : documents.find((d) => d.id === scopeId)?.title ?? activeDoc?.title;

  // ---- Onboarding (no documents yet) ----------------------------------------
  if (!hasDocuments) {
    return (
      <div className="min-h-screen flex flex-col app-canvas">
        <Header />
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Add a document to begin</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Index a technical document, then ask questions and trace every answer back to its sources.
          </p>
          <div className="mt-6">
            <IngestPanel onSuccess={handleIngestSuccess} />
          </div>
        </main>
      </div>
    );
  }

  // ---- Workspace (three panels) ---------------------------------------------
  return (
    <div className="h-screen flex flex-col app-canvas overflow-hidden">
      <Header />

      <div
        className="flex-1 min-h-0 w-full max-w-[1400px] mx-auto px-3 sm:px-4 py-4 grid gap-4"
        style={{
          gridTemplateColumns: evidenceOpen
            ? 'minmax(220px,260px) minmax(0,1fr) minmax(280px,340px)'
            : 'minmax(220px,260px) minmax(0,1fr)',
        }}
      >
        {/* Left — library */}
        <div className="hidden lg:block min-h-0">
          <DocumentLibrary
            documents={documents}
            activeId={scopeId}
            onSelect={setScopeId}
            onAddDocument={() => setShowAdd(true)}
          />
        </div>

        {/* Center — conversation */}
        <div className="min-h-0 flex flex-col border border-paper-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
            {inputOpen ? (
              <QueryInterface
                loading={queryLoading}
                onSubmit={handleAsk}
                activeDocTitle={scopedTitle}
                focusSignal={focusSignal}
              />
            ) : (
              <div className="space-y-4 animate-slide-up">
                {askedQuestion && <QuestionCard question={askedQuestion} onReopen={reopenInput} />}

                {clarifyQuestion ? (
                  <div role="group" aria-label="Choose a document" className="rounded-xl border border-amber-200 bg-amber-50 p-4 animate-fade-in">
                    <p className="text-sm text-ink">
                      Which document should I search for <span className="font-medium">“{clarifyQuestion}”</span>?
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {documents.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleClarifySelect(d.id)}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-sand-200 bg-white text-ink hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          {d.title}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleClarifySelect('all')}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-sand-200 bg-white text-ink-soft hover:bg-sand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        Search all documents
                      </button>
                    </div>
                  </div>
                ) : (
                  <AnswerDisplay
                    result={queryResult}
                    loading={queryLoading}
                    error={queryError}
                    citations={citations}
                    onTrace={handleTrace}
                    onAskAnother={reopenInput}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — evidence */}
        {evidenceOpen && (
          <div className="hidden lg:block min-h-0">
            <EvidencePanel
              open={evidenceOpen}
              onClose={() => setEvidenceOpen(false)}
              citations={citations}
              sourcesUsed={queryResult?.response.sourcesUsed ?? null}
              highlighted={highlightedCite}
            />
          </div>
        )}
      </div>

      {/* Add document modal */}
      {showAdd && (
        <div className="fixed inset-0 z-30 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowAdd(false)}
            className="fixed inset-0 bg-ink/30"
          />
          <div className="relative w-full max-w-xl mt-8">
            <IngestPanel onSuccess={handleIngestSuccess} />
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="mt-3 w-full text-center text-sm text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
