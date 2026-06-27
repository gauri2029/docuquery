import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const EXAMPLE_QUESTIONS = [
  'What are the main features described in the documentation?',
  'How do I authenticate with the API?',
  'Summarize the key configuration options',
];

interface QueryInterfaceProps {
  loading: boolean;
  onSubmit: (question: string) => void;
  /** Title of the document the user just ingested, shown as active context. */
  activeDocTitle?: string;
  /** Increment to programmatically focus the input (on reveal / "ask another"). */
  focusSignal?: number;
}

export function QueryInterface({ loading, onSubmit, activeDocTitle, focusSignal }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusSignal) textareaRef.current?.focus();
  }, [focusSignal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // guard against duplicate submissions
    const trimmed = question.trim();
    if (!trimmed) {
      setError('Please enter a question');
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    onSubmit(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function fillExample(q: string) {
    setQuestion(q);
    setError(null);
    textareaRef.current?.focus();
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Ask a question</h2>
          <p className="text-sm text-slate-500 mt-0.5">Answers are grounded in your ingested content.</p>
        </div>
        {activeDocTitle && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 max-w-[55%]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate">{activeDocTitle}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="question-input" className="sr-only">Your question</label>
          <div className="relative">
            <textarea
              id="question-input"
              ref={textareaRef}
              value={question}
              onChange={(e) => { setQuestion(e.target.value); if (error) setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your document… (Enter to submit, Shift+Enter for newline)"
              rows={3}
              disabled={loading}
              aria-describedby={error ? 'question-error' : 'question-hint'}
              aria-invalid={!!error}
              className={[
                'w-full px-4 py-3 pr-12 text-sm rounded-xl border bg-white transition-colors resize-none',
                'placeholder:text-slate-400 text-slate-900',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                'disabled:bg-slate-50 disabled:text-slate-400',
                error ? 'border-red-400' : 'border-slate-200',
              ].join(' ')}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 bottom-3 w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Submit question"
            >
              {loading ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          {error ? (
            <p id="question-error" role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>
          ) : (
            <p id="question-hint" className="mt-1.5 text-xs text-slate-400">
              Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Enter</kbd> to send
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => fillExample(q)}
                disabled={loading}
                className="inline-flex text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Searching documents…' : 'Ask DocuQuery'}
        </Button>
      </form>
    </Card>
  );
}
