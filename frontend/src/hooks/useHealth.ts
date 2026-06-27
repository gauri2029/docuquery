import { useState, useEffect } from 'react';
import type { BackendStatus, HealthResponse } from '../types';
import { docuqueryApi } from '../api/docuquery';

const POLL_INTERVAL_MS = 30_000;

export function useHealth() {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [detail, setDetail] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const data = await docuqueryApi.health(controller.signal);
        setDetail(data);
        setStatus(data.status === 'UP' ? 'online' : 'degraded');
      } catch {
        if (!controller.signal.aborted) {
          setStatus('offline');
          setDetail(null);
        }
      }
      if (!controller.signal.aborted) {
        timeoutId = setTimeout(check, POLL_INTERVAL_MS);
      }
    }

    void check();
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return { status, detail };
}
