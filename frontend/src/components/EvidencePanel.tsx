interface EvidencePanelProps {
  open: boolean;
  onClose: () => void;
  /** Cited section labels, in the order they are numbered in the answer. */
  citations: string[];
  sourcesUsed: number | null;
  highlighted: number | null;
}

/**
 * Right rail: evidence for the current answer. The backend returns cited
 * section labels (inside the answer) and a retrieved-chunk count — not the raw
 * passage text — so we surface exactly those, numbered to match the answer's
 * inline markers. Nothing here is fabricated.
 */
export function EvidencePanel({ open, onClose, citations, sourcesUsed, highlighted }: EvidencePanelProps) {
  if (!open) return null;

  return (
    <aside className="flex flex-col h-full border border-paper-200 rounded-lg bg-paper-50 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Evidence</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close evidence panel"
          className="text-ink-faint hover:text-ink rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sourcesUsed !== null && (
          <p className="text-xs text-ink-soft">
            Retrieved <span className="font-semibold text-ink">{sourcesUsed}</span> source chunk
            {sourcesUsed !== 1 ? 's' : ''} for this answer.
          </p>
        )}

        {citations.length > 0 ? (
          <ol className="space-y-2">
            {citations.map((c, idx) => {
              const n = idx + 1;
              const isHot = highlighted === n;
              return (
                <li
                  key={c}
                  className={[
                    'flex items-start gap-2.5 rounded-md border p-2.5 transition-colors',
                    isHot ? 'border-amber-300 bg-amber-50' : 'border-paper-200 bg-white',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold',
                      isHot ? 'bg-amber-500 text-white' : 'bg-brand-700 text-white',
                    ].join(' ')}
                  >
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink break-words">{c}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">Cited section</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-xs text-ink-faint">
            This answer did not include inline source citations.
          </p>
        )}

        <p className="text-[11px] leading-relaxed text-ink-faint pt-1 border-t border-paper-200">
          Citations are the document sections the model referenced. The API returns cited
          section labels and the retrieved-chunk count, not raw passage text.
        </p>
      </div>
    </aside>
  );
}
