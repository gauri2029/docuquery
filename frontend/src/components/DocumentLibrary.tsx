import type { DocumentRecord } from '../types';

interface DocumentLibraryProps {
  documents: DocumentRecord[];
  activeId: number | 'all';
  onSelect: (id: number | 'all') => void;
  onAddDocument: () => void;
}

/** Left rail: indexed document library with active-document selection. */
export function DocumentLibrary({ documents, activeId, onSelect, onAddDocument }: DocumentLibraryProps) {
  return (
    <aside className="flex flex-col h-full border border-sand-200 rounded-xl bg-sand-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">Documents</h2>
        <button
          type="button"
          onClick={onAddDocument}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1.5 py-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Document library">
        <LibraryItem
          label="All documents"
          sub={`${documents.length} indexed`}
          active={activeId === 'all'}
          onClick={() => onSelect('all')}
        />
        {documents.map((d) => (
          <LibraryItem
            key={d.id}
            label={d.title}
            sub={`${d.chunkCount} chunk${d.chunkCount !== 1 ? 's' : ''}`}
            active={activeId === d.id}
            onClick={() => onSelect(d.id)}
          />
        ))}
      </nav>

      <div className="p-2 border-t border-sand-200">
        <button
          type="button"
          onClick={onAddDocument}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-md border border-sand-200 bg-white text-ink hover:bg-sand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add document
        </button>
      </div>
    </aside>
  );
}

function LibraryItem({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={[
        'w-full text-left rounded-md px-3 py-2 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        active
          ? 'border-brand-200 bg-brand-50'
          : 'border-transparent hover:bg-sand-100',
      ].join(' ')}
    >
      <span className={['block text-sm truncate', active ? 'font-semibold text-brand-800' : 'text-ink'].join(' ')}>
        {label}
      </span>
      <span className="block text-[11px] text-ink-faint mt-0.5">{sub}</span>
    </button>
  );
}
