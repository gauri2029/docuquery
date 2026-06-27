import { useState } from 'react';
import type { DocumentRecord } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

interface DocumentListProps {
  documents: DocumentRecord[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DocumentList({ documents, loading, error, onDelete, onRefresh }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeletingId(id);
    onDelete(id);
    setDeletingId(null);
  }

  const refreshAction = (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
      aria-label="Refresh document list"
    >
      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );

  return (
    <Card>
      <CardHeader
        title="Document Library"
        description={`${documents.length} document${documents.length !== 1 ? 's' : ''} in knowledge base`}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        action={refreshAction}
      />

      <div className="p-3">
        {loading && documents.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No documents yet</p>
            <p className="text-xs text-slate-400 mt-1">Ingest your first document above</p>
          </div>
        )}

        {documents.length > 0 && (
          <ul className="space-y-1.5" role="list" aria-label="Ingested documents">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="group flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate" title={doc.title}>
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {doc.chunkCount} chunk{doc.chunkCount !== 1 ? 's' : ''} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 px-2"
                  aria-label={`Delete ${doc.title}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
