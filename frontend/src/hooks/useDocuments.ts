import { useState, useCallback, useEffect } from 'react';
import type { DocumentRecord } from '../types';
import { docuqueryApi, ApiError } from '../api/docuquery';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await docuqueryApi.listDocuments(signal);
      if (!signal?.aborted) setDocuments(data);
    } catch (e) {
      if (signal?.aborted) return;
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Failed to load documents');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      await docuqueryApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // non-critical — the list will resync on next refresh
    }
  }, []);

  // initial load
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { documents, loading, error, refresh, remove };
}
