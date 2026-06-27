import { Card } from './ui/Card';

/** Muted, locked placeholder for the query step shown before a document is ingested. */
export function QueryLocked() {
  return (
    <Card className="border-dashed bg-slate-50/60">
      <div className="flex flex-col items-center text-center px-6 py-14">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">Ask questions</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Ingest a document to start asking questions.
        </p>
      </div>
    </Card>
  );
}
