interface StepperProps {
  /** 1 = adding a document, 2 = asking questions. */
  current: 1 | 2;
  /** Whether step 1 (ingestion) has been completed. */
  step1Complete: boolean;
}

interface StepDef {
  index: 1 | 2;
  label: string;
  hint: string;
}

const STEPS: StepDef[] = [
  { index: 1, label: 'Add document', hint: 'Upload or paste content' },
  { index: 2, label: 'Ask questions', hint: 'Natural-language Q&A' },
];

/** Simple two-step progress indicator with obvious current/complete states. */
export function Stepper({ current, step1Complete }: StepperProps) {
  return (
    <ol className="flex items-center gap-3 sm:gap-4" aria-label="Workflow progress">
      {STEPS.map((step, i) => {
        const complete = step.index === 1 ? step1Complete : false;
        const active = step.index === current && !complete;
        const locked = step.index === 2 && !step1Complete;

        return (
          <li key={step.index} className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  complete
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                {complete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.index
                )}
              </span>
              <div className="min-w-0">
                <p className={['text-sm font-medium truncate', active || complete ? 'text-slate-900' : 'text-slate-400'].join(' ')}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-400 truncate hidden sm:block">
                  {locked ? 'Locked until step 1 is done' : step.hint}
                </p>
              </div>
            </div>

            {i < STEPS.length - 1 && (
              <span
                className={['h-px flex-1 transition-colors', step1Complete ? 'bg-emerald-300' : 'bg-slate-200'].join(' ')}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
