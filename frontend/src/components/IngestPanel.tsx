import { useState, useRef } from 'react';
import type { IngestResponse } from '../types';
import { docuqueryApi, ApiError } from '../api/docuquery';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface IngestPanelProps {
  onSuccess: (result: IngestResponse) => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

function validate(title: string, content: string): FormErrors {
  const errors: FormErrors = {};
  if (!title.trim()) errors.title = 'Title is required';
  if (!content.trim()) errors.content = 'Content is required';
  else if (content.trim().length < 20) errors.content = 'Content is too short (minimum 20 characters)';
  return errors;
}

export function IngestPanel({ onSuccess }: IngestPanelProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<IngestResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validate(title, content);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setApiError(null);
    setLastResult(null);

    try {
      const result = await docuqueryApi.ingest(
        { title: title.trim(), content: content.trim() },
        abortRef.current.signal,
      );
      setLastResult(result);
      onSuccess(result);
      setTitle('');
      setContent('');
      setErrors({});
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setApiError(e instanceof ApiError ? e.message : 'Ingestion failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Add Document"
        description="Paste text to embed into the knowledge base"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
        {/* Success banner */}
        {lastResult && (
          <div
            role="alert"
            className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in"
          >
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                "{lastResult.title}" ingested
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {lastResult.chunksCreated} chunk{lastResult.chunksCreated !== 1 ? 's' : ''} created · ID #{lastResult.documentId}
              </p>
            </div>
          </div>
        )}

        {/* API error banner */}
        {apiError && (
          <div role="alert" className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="doc-title" className="block text-xs font-medium text-slate-700 mb-1.5">
            Document title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="doc-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
            placeholder="e.g. API Reference v2"
            disabled={loading}
            aria-describedby={errors.title ? 'title-error' : undefined}
            aria-invalid={!!errors.title}
            className={[
              'w-full px-3 py-2 text-sm rounded-xl border bg-white transition-colors',
              'placeholder:text-slate-400 text-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-400',
              errors.title ? 'border-red-400' : 'border-slate-200',
            ].join(' ')}
          />
          {errors.title && (
            <p id="title-error" role="alert" className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="doc-content" className="block text-xs font-medium text-slate-700 mb-1.5">
            Content <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="doc-content"
            value={content}
            onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: undefined })); }}
            placeholder="Paste plain text or Markdown…"
            rows={6}
            disabled={loading}
            aria-describedby={errors.content ? 'content-error' : undefined}
            aria-invalid={!!errors.content}
            className={[
              'w-full px-3 py-2 text-sm rounded-xl border bg-white transition-colors resize-y',
              'placeholder:text-slate-400 text-slate-900 font-mono leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-400',
              errors.content ? 'border-red-400' : 'border-slate-200',
            ].join(' ')}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.content ? (
              <p id="content-error" role="alert" className="text-xs text-red-600">{errors.content}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-400">{content.length.toLocaleString()} chars</span>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          aria-label={loading ? 'Ingesting document…' : 'Ingest document'}
        >
          {loading ? 'Ingesting…' : 'Ingest document'}
        </Button>
      </form>
    </Card>
  );
}
