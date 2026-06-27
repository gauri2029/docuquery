import { useState, useRef } from 'react';
import type { IngestResponse } from '../types';
import { docuqueryApi, ApiError } from '../api/docuquery';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface IngestPanelProps {
  onSuccess: (result: IngestResponse) => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

type Mode = 'upload' | 'paste';

interface FileMeta {
  name: string;
  size: number;
  type: string;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileExtensionLabel(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : 'TEXT';
}

function validate(title: string, content: string): FormErrors {
  const errors: FormErrors = {};
  if (!title.trim()) errors.title = 'Title is required';
  if (!content.trim()) errors.content = 'Content is required';
  else if (content.trim().length < 20) errors.content = 'Content is too short (minimum 20 characters)';
  return errors;
}

export function IngestPanel({ onSuccess }: IngestPanelProps) {
  const [mode, setMode] = useState<Mode>('upload');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Read a user-selected file in the browser and populate the form fields.
  function handleFile(file: File) {
    setApiError(null);

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
      setFileMeta({ name: file.name, size: file.size, type: file.type || fileExtensionLabel(file.name) });
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
    setFileMeta(null);
    setContent('');
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setApiError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // guard against duplicate submissions
    const formErrors = validate(title, content);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setApiError(null);

    try {
      const result = await docuqueryApi.ingest(
        { title: title.trim(), content: content.trim() },
        abortRef.current.signal,
      );
      onSuccess(result);
      // Reset local form; the parent drives the transition to step 2.
      setTitle('');
      setContent('');
      setFileMeta(null);
      setErrors({});
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setApiError(e instanceof ApiError ? e.message : 'Ingestion failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-6">
        <h2 className="text-base font-semibold text-slate-900">Add a document</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a text or Markdown file, or paste content directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
        {/* API error banner — only shown when a request actually fails */}
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
            placeholder="e.g. AtlasFlow README"
            disabled={loading}
            aria-describedby={errors.title ? 'title-error' : undefined}
            aria-invalid={!!errors.title}
            className={[
              'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors',
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

        {/* Source tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Document source">
          {(['upload', 'paste'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              disabled={loading}
              className={[
                'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {m === 'upload' ? 'Upload file' : 'Paste text'}
            </button>
          ))}
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div role="tabpanel">
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
                id="doc-file"
                type="file"
                accept={ACCEPTED_ATTR}
                onChange={onFileInputChange}
                disabled={loading}
                className="sr-only"
              />
              {fileMeta ? (
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{fileMeta.name}</p>
                      <p className="text-xs text-slate-400">
                        {fileExtensionLabel(fileMeta.name)} · {formatBytes(fileMeta.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <label
                      htmlFor="doc-file"
                      className="text-xs text-slate-500 hover:text-brand-700 cursor-pointer rounded px-2 py-1 focus-within:ring-2 focus-within:ring-brand-500"
                    >
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={loading}
                      className="text-xs text-slate-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="doc-file"
                  className="flex flex-col items-center justify-center gap-1.5 p-7 cursor-pointer text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-1 shadow-sm">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-600">
                    <span className="font-medium text-brand-600">Choose a file</span> or drag &amp; drop
                  </span>
                  <span className="text-xs text-slate-400">{ACCEPTED_EXTENSIONS.join(', ')} · max 5 MB</span>
                </label>
              )}
            </div>
            {errors.content && !fileMeta && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">Select a file or switch to “Paste text”.</p>
            )}
          </div>
        )}

        {/* Paste mode */}
        {mode === 'paste' && (
          <div role="tabpanel">
            <label htmlFor="doc-content" className="block text-xs font-medium text-slate-700 mb-1.5">
              Content <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="doc-content"
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: undefined })); }}
              placeholder="Paste plain text or Markdown…"
              rows={7}
              disabled={loading}
              aria-describedby={errors.content ? 'content-error' : undefined}
              aria-invalid={!!errors.content}
              className={[
                'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors resize-y',
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
        )}

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
          aria-label={loading ? 'Ingesting document…' : 'Ingest document'}
        >
          {loading ? 'Ingesting…' : 'Ingest document'}
        </Button>
      </form>
    </Card>
  );
}
