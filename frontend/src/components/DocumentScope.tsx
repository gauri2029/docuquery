export interface ScopeOption {
  id: number;
  title: string;
}

interface DocumentScopeProps {
  options: ScopeOption[];
  value: number | 'all';
  onChange: (value: number | 'all') => void;
}

/**
 * Persistent document picker. Lets the user choose which document questions
 * are answered from (or all of them), so we never have to re-ask per question.
 */
export function DocumentScope({ options, value, onChange }: DocumentScopeProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
      <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <label htmlFor="doc-scope" className="text-xs font-medium text-slate-500 shrink-0">
        Answer from
      </label>
      <select
        id="doc-scope"
        value={value === 'all' ? 'all' : String(value)}
        onChange={(e) => onChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        className="flex-1 min-w-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md cursor-pointer"
      >
        <option value="all">All documents</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.title}
          </option>
        ))}
      </select>
    </div>
  );
}
