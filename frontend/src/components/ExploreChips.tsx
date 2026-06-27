interface Topic {
  label: string;
  question: string;
  emoji: string;
}

// Topics map to a ready-made question that is placed into the input (not sent).
const TOPICS: Topic[] = [
  { label: 'Architecture', emoji: '🏗️', question: 'How is the system architected?' },
  { label: 'Features', emoji: '✨', question: 'What are the main features described in this document?' },
  { label: 'Setup', emoji: '⚙️', question: 'How do I set up and run the project locally?' },
  { label: 'APIs', emoji: '🔌', question: 'What API endpoints are available and how are they used?' },
  { label: 'Security', emoji: '🔒', question: 'What security measures and controls are in place?' },
  { label: 'Deployment', emoji: '🚀', question: 'How is the application deployed?' },
  { label: 'Testing', emoji: '🧪', question: 'What is the testing strategy?' },
  { label: 'Troubleshooting', emoji: '🛠️', question: 'What are common troubleshooting steps?' },
];

interface ExploreChipsProps {
  /** Populate the question input without submitting. */
  onPick: (question: string) => void;
  disabled?: boolean;
}

export function ExploreChips({ onPick, disabled }: ExploreChipsProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" aria-hidden="true" />
        Explore this document
      </p>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(t.question)}
            style={{ animationDelay: `${idx * 45}ms` }}
            className="chip-in inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
