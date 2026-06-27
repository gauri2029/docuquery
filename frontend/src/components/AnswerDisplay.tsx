import { useState } from 'react';
import type { QueryResult } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Spinner } from './ui/Spinner';

interface AnswerDisplayProps {
  result: QueryResult | null;
  loading: boolean;
  error: string | null;
  /** Clears the current answer and returns focus to the question input. */
  onAskAnother?: () => void;
}

function formatLatency(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AnswerDisplay({ result, loading, error, onAskAnother }: AnswerDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function copyAnswer() {
    if (!result) return;
    await navigator.clipboard.writeText(result.response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const copyAction = result ? (
    <button
      onClick={copyAnswer}
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1"
      aria-label="Copy answer to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  ) : undefined;

  return (
    <Card>
      <CardHeader
        title="Answer"
        description="Generated from your document knowledge base"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        }
        action={copyAction}
      />

      <div className="p-5">
        {/* Empty state */}
        {!loading && !error && !result && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Ready to answer</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Ingest at least one document, then ask a question to see an AI-generated answer here.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center py-12 text-center animate-fade-in" role="status" aria-label="Generating answer">
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">Searching documents…</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving context and generating answer</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Query failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Answer */}
        {result && !loading && (
          <div className="animate-slide-up space-y-4">
            {/* Question echo */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 italic">{result.response.question}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Answer text */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm text-slate-800 leading-relaxed answer-prose whitespace-pre-wrap"
                  aria-label="Generated answer"
                >
                  {result.response.answer}
                </div>
              </div>
            </div>

            {/* Footer: sources + latency */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              {/* Sources badge */}
              {result.response.sourcesUsed > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-100 rounded-full">
                  <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-brand-700">
                    {result.response.sourcesUsed} source chunk{result.response.sourcesUsed !== 1 ? 's' : ''} used
                  </span>
                </div>
              ) : (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full"
                  role="note"
                  aria-label="No relevant context found"
                >
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs font-medium text-amber-700">No relevant context found</span>
                </div>
              )}

              {/* Latency badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-slate-500">{formatLatency(result.latencyMs)}</span>
              </div>

              {/* Ask another question */}
              {onAskAnother && (
                <button
                  type="button"
                  onClick={onAskAnother}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Ask another question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
