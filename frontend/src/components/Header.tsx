/**
 * Compact product header: logo mark, name, and a short descriptor.
 * Intentionally free of backend-status chips or developer links so the app
 * reads as a finished product rather than a demo.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">DocuQuery</h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Source-grounded answers from your documentation
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
