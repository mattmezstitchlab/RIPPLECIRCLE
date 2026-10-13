/**
 * ClockHeader — engraved blueprint brand bar, exactly as in the reference.
 * Kept thin and understated; the jewel is the star.
 */
export function ClockHeader() {
  return (
    <header className="relative z-20 flex h-[74px] items-start justify-between border-b border-black/80 px-7 pt-[18px]">
      <div>
        <h1
          className="text-[34px] font-bold leading-[0.85] tracking-[0.06em]"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          RIPPLE CIRCLE <span className="font-medium text-[#444]">—</span>
        </h1>
        <p className="mt-1 text-[19px]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          Horloge architecturale d&apos;orchestration
        </p>
        <small className="mt-1.5 block text-[8.5px] leading-[1.7] tracking-[0.22em] text-[#555]">
          TEMPS · PERSONNES · ACTIONS · MÉMOIRE · MUSIQUE · RELATIONS — UN SEUL SYSTÈME
        </small>
      </div>
      <div className="text-right">
        <div className="text-[9px] font-bold tracking-[0.24em]">∇ SOLSTICE D&apos;HIVER · DÉC. · JANV.</div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}
          className="mt-2 inline-block border border-black/80 bg-white/80 px-2.5 py-1 text-[8px] font-bold tracking-[0.2em] backdrop-blur hover:bg-white"
        >
          ← RETOUR 2D
        </a>
      </div>
    </header>
  );
}
