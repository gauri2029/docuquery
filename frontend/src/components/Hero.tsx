/**
 * Landing hero shown above the workflow. Pure CSS/SVG visual — no stock imagery.
 * Communicates the product value in one heading + one supporting sentence.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {/* Soft gradient + grid backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(226 232 240 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center justify-between gap-6 px-6 py-6 sm:px-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/80 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Retrieval-augmented Q&amp;A
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Turn documentation into{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
              answers.
            </span>
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-slate-600 leading-relaxed">
            Add a technical document, ask questions in natural language, and get answers grounded in the source.
          </p>
        </div>

        {/* Abstract document + search graphic */}
        <div className="hidden lg:flex shrink-0 justify-center">
          <AbstractGraphic />
        </div>
      </div>
    </section>
  );
}

function AbstractGraphic() {
  return (
    <svg width="150" height="120" viewBox="0 0 220 180" fill="none" aria-hidden="true" className="drop-shadow-sm">
      <defs>
        <linearGradient id="dq-doc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f0f4ff" />
        </linearGradient>
        <linearGradient id="dq-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a6cf7" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Back document */}
      <rect x="34" y="26" width="116" height="140" rx="12" fill="url(#dq-doc)" stroke="#dde7ff" />
      {/* Front document */}
      <rect x="58" y="14" width="116" height="140" rx="12" fill="#ffffff" stroke="#c3d3ff" />
      {/* Text lines */}
      <rect x="74" y="34" width="84" height="8" rx="4" fill="#e2e8f0" />
      <rect x="74" y="52" width="64" height="6" rx="3" fill="#eef2f7" />
      <rect x="74" y="66" width="78" height="6" rx="3" fill="#eef2f7" />
      <rect x="74" y="80" width="54" height="6" rx="3" fill="#eef2f7" />
      <rect x="74" y="100" width="84" height="6" rx="3" fill="#eef2f7" />
      <rect x="74" y="114" width="40" height="6" rx="3" fill="#eef2f7" />

      {/* Search bubble */}
      <circle cx="150" cy="132" r="30" fill="url(#dq-accent)" />
      <circle cx="146" cy="128" r="11" fill="none" stroke="#ffffff" strokeWidth="3.5" />
      <line x1="154" y1="136" x2="163" y2="145" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
