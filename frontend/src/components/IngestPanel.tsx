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

// The backend only accepts text content ({ title, content }). We therefore read
// files in the browser and send their text — no backend/file-upload support is
// required. Binary formats (.pdf, .docx) are intentionally excluded: the browser
// cannot read them as text and the backend cannot parse them.
const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.markdown', '.csv', '.json', '.log', '.rst', '.html'];
const ACCEPTED_ATTR = `${ACCEPTED_EXTENSIONS.join(',')},text/*`;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB guard against accidentally huge files

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Strip the extension from a filename to use as a default document title. */
function titleFromFilename(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read a user-selected file in the browser and populate the form fields.
  function handleFile(file: File) {
    setApiError(null);
    setLastResult(null);

    if (!hasAcceptedExtension(file.name) && !file.type.startsWith('text/')) {
      setApiError(`Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setApiError(`File is too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB).`);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setApiError('Could not read the file. Please try again.');
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setContent(text);
      setFileName(file.name);
      // Only auto-fill the title if the user hasn't typed one.
      setTitle((prev) => (prev.trim() ? prev : titleFromFilename(file.name)));
      setErrors({});
    };
    reader.readAsText(file);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // allow re-selecting the same file
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (loading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setFileName(null);
    setContent('');
  }

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
      setFileName(null);
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
        description="Upload a text/Markdown file or paste content to embed"
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

        {/* File upload drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!loading) setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={onDrop}
          className={[
            'rounded-xl border-2 border-dashed transition-colors',
            dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50/50',
            loading ? 'opacity-60' : '',
          ].join(' ')}
        >
          <input
            ref={fileInputRef}
            id="doc-file"
            type="file"
            accept={ACCEPTED_ATTR}
            onChange={onFileInputChange}
            disabled={loading}
            className="sr-only"
          />
          {fileName ? (
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-slate-700 truncate">{fileName}</span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                disabled={loading}
                className="text-xs text-slate-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1.5 py-0.5 shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <label
              htmlFor="doc-file"
              className="flex flex-col items-center justify-center gap-1.5 p-5 cursor-pointer text-center"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-slate-600">
                <span className="font-medium text-brand-600">Choose a file</span> or drag &amp; drop
              </span>
              <span className="text-xs text-slate-400">{ACCEPTED_EXTENSIONS.join(', ')} · max 5 MB</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-100" />
          <span className="text-xs text-slate-400">or paste manually</span>
          <span className="h-px flex-1 bg-slate-100" />
        </div>

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
