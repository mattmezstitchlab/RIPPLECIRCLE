/**
 * ClockHeader — top brand bar above the 3D viewport.
 * Uses the same paper/ink palette as the scene for visual coherence.
 */
export function ClockHeader() {
  return (
    <header className="relative z-20 flex h-[74px] items-start justify-between border-b border-black/80 px-7 pt-[18px]">
      <div>
        <h1 className="font-serif text-[34px] font-bold leading-[0.85] tracking-[0.06em]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          RIPPLE CIRCLE <span className="font-medium text-[color:#444]">—</span>
        </h1>
        <p className="mt-1 font-serif text-[19px]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          Horloge architecturale d&apos;orchestration
        </p>
        <small className="mt-1.5 block text-[8.5px] leading-[1.7] tracking-[0.22em] text-[#555]">
          TEMPS · PERSONNES · ACTIONS · MÉMOIRE · MUSIQUE · RELATIONS — UN SEUL SYSTÈME
        </small>
      </div>
      <a
        href="#"
        className="border border-black/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] backdrop-blur hover:bg-white"
      >
        ← RETOUR 2D
      </a>
    </header>
  );
}
