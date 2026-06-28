interface QuestionCardProps {
  question: string;
  onReopen: () => void;
}

/** Minimized summary of the asked question; clicking reopens the input. */
export function QuestionCard({ question, onReopen }: QuestionCardProps) {
  return (
    <button
      type="button"
      onClick={onReopen}
      className="lift group w-full text-left flex items-center gap-3 rounded-xl border border-brand-700/15 bg-brand-700 text-white px-4 py-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/15">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-wide text-paper-200/70">Your question</span>
        <span className="block text-sm font-medium truncate">{question}</span>
      </span>
      <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-paper-200/80 group-hover:text-white transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </span>
    </button>
  );
}
