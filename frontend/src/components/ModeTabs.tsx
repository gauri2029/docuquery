export type Mode = 'ask' | 'upload';

interface ModeTabsProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
  /** Ask is locked until at least one document has been ingested this session. */
  askLocked: boolean;
}

interface TabDef {
  id: Mode;
  label: string;
  icon: React.ReactNode;
}

const askIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const uploadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

/**
 * Segmented control to switch between asking questions and adding documents.
 * Users can move freely between the two once a document has been ingested.
 */
export function ModeTabs({ mode, onChange, askLocked }: ModeTabsProps) {
  const tabs: TabDef[] = [
    { id: 'ask', label: 'Ask questions', icon: askIcon },
    { id: 'upload', label: 'Add document', icon: uploadIcon },
  ];

  return (
    <div
      role="tablist"
      aria-label="Choose what to do"
      className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm"
    >
      {tabs.map((tab) => {
        const disabled = tab.id === 'ask' && askLocked;
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            title={disabled ? 'Add a document first' : undefined}
            className={[
              'relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              active
                ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-500/20'
                : disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {disabled ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              tab.icon
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
