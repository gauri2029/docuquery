interface Topic {
  label: string;
  question: string;
}

// Topics map to a ready-made question that is placed into the input (not sent).
const TOPICS: Topic[] = [
  { label: 'Architecture', question: 'How is the system architected?' },
  { label: 'Features', question: 'What are the main features described in this document?' },
  { label: 'Setup', question: 'How do I set up and run the project locally?' },
  { label: 'APIs', question: 'What API endpoints are available and how are they used?' },
  { label: 'Security', question: 'What security measures and controls are in place?' },
  { label: 'Deployment', question: 'How is the application deployed?' },
  { label: 'Testing', question: 'What is the testing strategy?' },
  { label: 'Troubleshooting', question: 'What are common troubleshooting steps?' },
];

interface ExploreChipsProps {
  /** Populate the question input without submitting. */
  onPick: (question: string) => void;
  disabled?: boolean;
}

export function ExploreChips({ onPick, disabled }: ExploreChipsProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-2">
        Explore this document
      </p>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(t.question)}
            style={{ animationDelay: `${idx * 40}ms` }}
            className="chip-in inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-md border border-paper-200 bg-white text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
