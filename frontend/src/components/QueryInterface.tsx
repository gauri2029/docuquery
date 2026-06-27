import { useState, useRef } from 'react';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

const EXAMPLE_QUESTIONS = [
  'What are the main features described in the documentation?',
  'How do I authenticate with the API?',
  'What error codes can the service return?',
  'Summarize the key configuration options',
];

interface QueryInterfaceProps {
  loading: boolean;
  onSubmit: (question: string) => void;
}

export function QueryInterface({ loading, onSubmit }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <CardHeader
        title="Ask a Question"
        description="Query your documents using natural language"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
      />

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Question input */}
        <div>
          <label htmlFor="question-input" className="sr-only">Your question</label>
          <div className="relative">
            <textarea
              id="question-input"
              ref={textareaRef}
              value={question}
              onChange={(e) => { setQuestion(e.target.value); if (error) setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents… (Enter to submit, Shift+Enter for newline)"
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
            {/* Inline submit icon */}
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

        {/* Example questions */}
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
