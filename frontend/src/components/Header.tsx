/**
 * Product header: custom mark + wordmark + subtitle on a layered teal surface.
 * Compact, with depth from gradient + border + restrained shadow (no plain
 * white navbar, no purple).
 */
export function Header() {
  return (
    <header className="relative z-20 border-b border-brand-900/40 bg-brand-800 text-paper shadow-[0_2px_16px_-6px_rgba(0,0,0,0.4)]">
      {/* Layered texture: soft radial glow + faint grid */}
      <div className="absolute inset-0 opacity-60" aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(420px 120px at 8% 0%, rgba(255,255,255,0.10), transparent 70%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: 'auto, 28px 28px',
        }}
      />
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-14">
          <Mark />
          <div className="leading-tight">
            <h1 className="font-display text-[17px] font-bold tracking-tight text-white">
              Docu<span className="text-amber-300">Query</span>
            </h1>
            <p className="text-[11px] text-paper-200/80 -mt-0.5">Document intelligence workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <span className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-brand-600 border border-brand-400/40 shadow-inner flex items-center justify-center">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* stacked pages */}
        <rect x="5" y="4" width="11" height="15" rx="2" fill="#ffffff" opacity="0.92" />
        <rect x="8" y="6.5" width="11" height="15" rx="2" fill="#fcd34d" />
        {/* query glyph */}
        <circle cx="13" cy="13" r="3" fill="none" stroke="#19413d" strokeWidth="1.6" />
        <line x1="15.2" y1="15.2" x2="17.5" y2="17.5" stroke="#19413d" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
