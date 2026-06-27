import type { BackendStatus, HealthResponse } from '../types';

interface StatusIndicatorProps {
  status: BackendStatus;
  detail: HealthResponse | null;
}

const labels: Record<BackendStatus, string> = {
  checking: 'Connecting…',
  online: 'Backend online',
  degraded: 'Degraded',
  offline: 'Backend offline',
};

const dotClasses: Record<BackendStatus, string> = {
  checking: 'bg-slate-400 animate-pulse',
  online: 'bg-emerald-500',
  degraded: 'bg-amber-400 animate-pulse',
  offline: 'bg-red-500',
};

const badgeClasses: Record<BackendStatus, string> = {
  checking: 'bg-slate-100 text-slate-600 border-slate-200',
  online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  degraded: 'bg-amber-50 text-amber-700 border-amber-200',
  offline: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusIndicator({ status, detail }: StatusIndicatorProps) {
  const title =
    detail
      ? `PostgreSQL: ${detail.postgres} · ChromaDB: ${detail.chromadb}`
      : status === 'offline'
      ? 'Cannot reach backend at localhost:8080'
      : 'Checking backend health…';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${badgeClasses[status]}`}
      title={title}
      aria-label={`Backend status: ${labels[status]}`}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${dotClasses[status]}`} aria-hidden="true" />
      {labels[status]}
    </div>
  );
}
