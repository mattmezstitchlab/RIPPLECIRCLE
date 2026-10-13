/**
 * ClockHUD — minimal, fading chrome over the jewel.
 *
 * Design principle: the 3D object IS the interface. Chrome appears on
 * hover/movement and fades away after idle so the user can contemplate
 * the instrument like an object on display.
 *
 * Visible when chromeVisible:
 *   - Top-left: small brand mark + "R · 2D" escape hatch back to 2D.
 *   - Top-right: four state pills (OBSERVED/PREDICTED/PROPOSED/CONFIRMED).
 *   - Center-top: compact view preset bar + back/front flip indicator.
 *   - Right: contextual inspector for the selected node (collapses to a dot
 *     when idle, expands on selection).
 *   - Bottom: single dock (play, explode, zoom, reset, flip).
 *   - Bottom-hint: subtle "double-cliquer pour retourner" hint that fades first.
 *
 * All panels use pointer-events-auto only in their own bounds; large empty
 * zones pass clicks through to the canvas (orbit / flip).
 */
import type { ClockStateApi } from '../../hooks/clock/useClockState';
import type { ClockState } from './lib/materials';
import { STATE_META } from './lib/materials';
import { getEntityInfo } from './lib/entityInfo';

interface Props {
  clock: ClockStateApi;
}

const VIEWS: { id: ClockStateApi['view']; label: string }[] = [
  { id: '3/4', label: '◈ 3/4' },
  { id: 'front', label: 'FACE' },
  { id: 'side', label: 'PROFIL' },
  { id: 'top', label: 'DESSUS' },
  { id: 'exploded', label: 'ÉCLATÉ' }
];

const STATES: ClockState[] = ['OBSERVED', 'PREDICTED', 'PROPOSED', 'CONFIRMED'];

export function ClockHUD({ clock }: Props) {
  const info = getEntityInfo(clock.selectedId);
  const visible = clock.chromeVisible;
  const opacity = visible ? 1 : 0;
  const pointer = visible ? 'auto' : 'none';
  const transition = 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 select-none"
      style={{ transition, opacity, color: '#111' } as React.CSSProperties}
    >
      {/* Top-left brand + 2D escape */}
      <div className="pointer-events-auto absolute left-5 top-5 flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}
          className="flex items-center gap-2 border border-black/80 bg-white/80 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.22em] backdrop-blur hover:bg-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-black" /> R · 2D
        </a>
        <span className="hidden font-serif text-[15px] tracking-[0.12em] text-black/70 sm:inline" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          RIPPLE CIRCLE
        </span>
      </div>

      {/* Top-right state pills */}
      <div
        className="pointer-events-auto absolute right-5 top-5 flex flex-col items-end gap-1.5"
        style={{ pointerEvents: pointer }}
      >
        <div className="flex gap-1">
          {STATES.map((s) => (
            <button
              key={s}
              onClick={() => clock.setState(s)}
              className={`flex items-center gap-1 border border-black/80 px-2 py-1 text-[7.5px] font-bold tracking-[0.2em] backdrop-blur ${clock.state === s ? 'bg-black text-white' : 'bg-white/75'}`}
            >
              <span
                className="h-[5px] w-[5px] rounded-full border border-black/80"
                style={{ background: clock.state === s ? '#fff' : `#${STATE_META[s].dot.toString(16).padStart(6, '0')}` }}
              />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* View preset bar — centered top */}
      <div
        className="pointer-events-auto absolute left-1/2 top-5 flex -translate-x-1/2 gap-1"
        style={{ pointerEvents: pointer }}
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => { clock.setView(v.id); if (v.id === 'exploded') clock.setExploded(1); else if (v.id === '3/4') clock.setExploded(0); }}
            className={`border border-black/80 px-2.5 py-1 text-[8px] font-bold tracking-[0.2em] backdrop-blur ${clock.view === v.id ? 'bg-black text-white' : 'bg-white/75 hover:bg-white'}`}
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={clock.toggleFlip}
          className={`border border-black/80 px-2.5 py-1 text-[8px] font-bold tracking-[0.2em] backdrop-blur ${clock.flipped ? 'bg-black text-white' : 'bg-white/75 hover:bg-white'}`}
        >
          {clock.flipped ? '↺ FACE' : '⚙ DOS'}
        </button>
      </div>

      {/* Right inspector — compact, paper card */}
      {!clock.flipped && (
        <div
          className="pointer-events-auto absolute right-5 top-20 w-[220px] border border-black/80 bg-white/85 p-3 shadow-[4px_4px_0_rgba(0,0,0,0.08)] backdrop-blur-xl"
          style={{ pointerEvents: pointer }}
        >
          <div className="text-[7px] tracking-[0.28em] text-[#777]">SÉLECTION</div>
          <div className="mt-1 font-serif text-[18px] leading-tight" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{info.name}</div>
          <div className="mt-1 text-[9.5px] leading-snug text-[#555]">{info.description}</div>
          <div className="mt-2 space-y-0.5 border-t border-black/10 pt-1.5 font-mono text-[8px] tracking-[0.05em]">
            <Row k="ID" v={clock.selectedId} />
            <Row k="TYPE" v={`${info.ringId}·${info.ringName}`} />
            <Row k="STATE" v={clock.state} />
            <Row k="LIENS" v={`${info.connectionCount}`} />
          </div>
          <button
            onClick={clock.triggerRipple}
            className="mt-2 w-full bg-black py-1.5 text-[8px] font-bold tracking-[0.2em] text-white hover:bg-black/85"
          >
            ⟡ PROPAGER UNE ONDE
          </button>
        </div>
      )}

      {/* Bottom dock — single elegant control bar */}
      <div
        className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap border border-black/80 bg-white/85 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        style={{ pointerEvents: pointer }}
      >
        <button
          onClick={() => clock.setPlaying((p) => !p)}
          className={`border border-black/80 px-2 py-1 text-[8px] font-bold tracking-[0.2em] ${clock.playing ? 'bg-black text-white' : 'bg-white'}`}
        >
          {clock.playing ? '❚❚' : '▶'}
        </button>
        <label className="px-1 text-[7.5px] font-bold tracking-[0.24em]">ÉCLATÉ</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(clock.exploded * 100)}
          onChange={(e) => clock.setExploded(Number(e.target.value) / 100)}
          className="w-[88px] accent-black"
        />
        <label className="px-1 text-[7.5px] font-bold tracking-[0.24em]">ZOOM</label>
        <div className="flex">
          <button onClick={() => clock.zoomBy(1.1)} className="w-6 border border-black/80 py-0.5 text-[12px] font-bold hover:bg-black/5">−</button>
          <button onClick={() => clock.zoomBy(0.9)} className="w-6 border border-black/80 py-0.5 text-[12px] font-bold hover:bg-black/5">+</button>
        </div>
        <button
          onClick={clock.reset}
          className="border border-black/80 px-2 py-1 text-[8px] font-bold tracking-[0.2em] hover:bg-black/5"
        >
          ↺
        </button>
        <button
          onClick={clock.toggleFlip}
          className="border border-black/80 px-2 py-1 text-[8px] font-bold tracking-[0.2em] hover:bg-black/5"
          title="Retourner le bijou (F)"
        >
          ⇅ DOS
        </button>
      </div>

      {/* Subtle bottom hint — fades fast */}
      <div
        className="pointer-events-none absolute bottom-[52px] left-1/2 -translate-x-1/2 text-[8px] tracking-[0.3em] text-[#888]"
        style={{ opacity: visible ? 0.7 : 0, transition: 'opacity 600ms ease 400ms' }}
      >
        {clock.flipped ? 'CLIQUER LA COURONNE F/R POUR REVENIR À LA FACE' : 'DOUBLE-CLIQUER LE VIDE · F POUR RETOURNER LE BIJOU'}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#777]">{k}</span>
      <b className="font-bold">{v}</b>
    </div>
  );
}
