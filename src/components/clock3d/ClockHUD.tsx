/**
 * ClockHUD — blueprint-styled HUD with the scientific-annotation side panels,
 * view preset bar, modes (A/B/C), inspector, bottom dock, paradigm card and
 * module detail card. Reverts to the rich layout that was working in the
 * previous build, while keeping the new DOS/FLIP button for the back plate.
 *
 * Unlike the brief all-black experiment, the paper frame + annotations
 * stay — they are part of the horological-blueprint reference and keep
 * the object legible.
 */
import type { ClockStateApi } from '../../hooks/clock/useClockState';
import type { ClockState } from './lib/materials';
import { STATE_META } from './lib/materials';
import { getEntityInfo } from './lib/entityInfo';

interface Props {
  clock: ClockStateApi;
}

const VIEWS: { id: ClockStateApi['view']; label: string }[] = [
  { id: '3/4', label: '◈ 3/4 VIEW' },
  { id: 'front', label: 'FRONT' },
  { id: 'side', label: 'SIDE PROFILE' },
  { id: 'top', label: 'TOP' },
  { id: 'exploded', label: 'EXPLODED' }
];

const STATES: ClockState[] = ['OBSERVED', 'PREDICTED', 'PROPOSED', 'CONFIRMED'];

const MODES: { id: ClockStateApi['mode']; tag: string; label: string }[] = [
  { id: 'instrument', tag: 'SIGNATURE A', label: 'The Instrument' },
  { id: 'connection', tag: 'SIGNATURE B', label: 'The Connection' },
  { id: 'consequence', tag: 'SIGNATURE C', label: 'The Consequence →' }
];

const STATUS_LABEL: Record<ClockStateApi['mode'], string> = {
  instrument: '● INSTRUMENT CALIBRÉ — 7 ANNEAUX INDÉPENDANTS — CLIQUER UN NŒUD POUR SÉLECTIONNER',
  connection: '⬢ CONNECTION — COUPLAGES MAGNÉTIQUES ACTIFS',
  consequence: '◎ CONSEQUENCE — PROPAGATION CAUSALE EN COURS'
};

export function ClockHUD({ clock }: Props) {
  const info = getEntityInfo(clock.selectedId);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-[color:#111]">
      {/* Frame */}
      <div className="pointer-events-none absolute inset-[14px] border border-[#bdb9ac]">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#f3f1ea] px-2 text-[8px] tracking-[0.24em] text-[#666]">
          ✣{clock.flipped ? ' DOS · MOUVEMENT ' : ' SOLSTICE D\'HIVER ∇'}
        </span>
        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#f3f1ea] px-2 text-[8px] tracking-[0.24em] text-[#666]">
          {clock.flipped ? '▲ COURONNES · RUBIS · PLIER AU BESOIN' : '▲ SOLSTICE D\'ÉTÉ JUIL.'}
        </span>
      </div>

      {/* View bar */}
      <div className="pointer-events-auto absolute left-1/2 top-4 z-20 flex -translate-x-1/2 gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => { clock.setView(v.id); if (v.id === 'exploded') clock.setExploded(1); else if (v.id === '3/4') clock.setExploded(0); }}
            className={`border border-black/80 bg-white/85 px-3 py-2 text-[9px] font-bold tracking-[0.14em] backdrop-blur ${clock.view === v.id ? 'bg-black text-white' : 'hover:bg-white'}`}
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={clock.toggleFlip}
          className={`border border-black/80 px-3 py-2 text-[9px] font-bold tracking-[0.14em] backdrop-blur ${clock.flipped ? 'bg-black text-white' : 'bg-white/85 hover:bg-white'}`}
        >
          {clock.flipped ? '↺ FACE' : '⇅ DOS'}
        </button>
      </div>

      {/* Status */}
      <div className="absolute left-1/2 top-[68px] z-10 -translate-x-1/2 text-[8px] tracking-[0.22em] text-[#777]">
        {clock.flipped ? '◐ VUE DU DOS — COURONNES M01 (MODE) · M02 (FOCUS) · POUSSOIR F/R' : STATUS_LABEL[clock.mode]}
      </div>

      {/* Modes (left) */}
      <div className="pointer-events-auto absolute left-5 top-[82px] z-20 hidden flex-col gap-1.5 lg:flex">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { clock.setMode(m.id); if (m.id === 'consequence') clock.triggerRipple(); }}
            disabled={clock.flipped}
            className={`min-w-[178px] border border-black/80 px-3 py-2 text-left backdrop-blur ${clock.mode === m.id && !clock.flipped ? 'bg-black text-white' : 'bg-white/85 hover:bg-white disabled:opacity-40'}`}
          >
            <span className={`block text-[8px] tracking-[0.16em] ${clock.mode === m.id && !clock.flipped ? 'text-white/70' : 'text-[#777]'}`}>{m.tag}</span>
            <span className="block text-[16px] leading-tight" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Inspector (right) */}
      {!clock.flipped && (
        <div className="pointer-events-auto absolute right-5 top-[82px] z-20 w-[252px] border border-black/80 bg-white/90 p-4 shadow-[8px_8px_0_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <label className="block text-[8px] tracking-[0.22em] text-[#777]">NOYAU IDENTITAIRE — SELECTED ENTITY</label>
          <h2 className="mt-1.5 text-[24px] leading-none" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{info.name}</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-[#555]">{info.description}</p>
          <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2">
            <Row label="ENTITY ID" value={clock.selectedId} />
            <Row label="RING / TYPE" value={`${info.ringId} · ${info.ringName}`} />
            <Row label="STATE" value={clock.state} />
            <Row label="CONNECTIONS" value={`${info.connectionCount} LINKS`} />
          </div>
          <button onClick={clock.triggerRipple} className="mt-3 w-full bg-black py-2.5 text-[10px] font-bold tracking-[0.14em] text-white hover:bg-black/85">
            ⟡ PROPAGER UNE ONDE
          </button>
        </div>
      )}
      {clock.flipped && (
        <div className="pointer-events-auto absolute right-5 top-[82px] z-20 w-[252px] border border-black/80 bg-white/90 p-4 shadow-[8px_8px_0_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <label className="block text-[8px] tracking-[0.22em] text-[#777]">DOS DU MOUVEMENT — CALIBRE RC-01</label>
          <h2 className="mt-1.5 text-[24px] leading-none" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>Mécanisme</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-[#555]">Plaque de titane brossé, vis de maintien, couronnes moletées M01 (MODE) et M02 (FOCUS), poussoir F/R, rubis central.</p>
          <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2 text-[9px] tracking-[0.08em]">
            <Row label="COMPOSANTS" value="216" />
            <Row label="RUBIS" value="1" />
            <Row label="COURONNES" value="2" />
            <Row label="RÉSERVE" value="—" />
          </div>
          <button onClick={clock.toggleFlip} className="mt-3 w-full border border-black/80 bg-white py-2 text-[10px] font-bold tracking-[0.14em] hover:bg-black/5">
            ↺ RETOUR FACE
          </button>
        </div>
      )}

      {/* State pills (top right, below topbar) */}
      <div className="pointer-events-auto absolute right-6 top-[82px] z-10 -mt-[62px] flex gap-1.5" style={{ display: 'none' }}>
        {STATES.map((s) => (
          <button key={s} onClick={() => clock.setState(s)}
            className={`flex items-center gap-1.5 border border-black/80 px-2.5 py-1.5 text-[8px] font-bold tracking-[0.16em] ${clock.state === s ? 'bg-black text-white' : 'bg-white/80'}`}>
            <span className="h-[7px] w-[7px] rounded-full border border-black/80"
              style={{ background: clock.state === s ? '#fff' : `#${STATE_META[s].dot.toString(16).padStart(6, '0')}` }} />
            {s}
          </button>
        ))}
      </div>

      {/* Left annotations */}
      <aside className="pointer-events-none absolute bottom-28 left-5 z-10 hidden w-[210px] space-y-7 lg:block" style={{ top: 'auto' }}>
        <Annotation title="Orchestration adaptative" body="Ajuste en temps réel les ressources, les priorités et les rythmes." side="left" tag={clock.flipped ? 'M01 · M02' : 'NOV.'} />
        <Annotation title={clock.flipped ? 'Plaque de maintien' : 'Couronne des relations'} body={clock.flipped ? '6 vis cruciformes, titane brossé, couvercle du mouvement.' : 'Représente les personnes, les équipes et leurs proximités. Couplages magnétiques dynamiques.'} side="left" />
        <Annotation title={clock.flipped ? 'Poussoir F/R' : 'Mémoire active'} body={clock.flipped ? 'Inverse la face — coiffe dorée, rappel tactile.' : 'Stocke, relie et réactive les événements, apprentissages et signaux faibles.'} side="left" />
      </aside>

      {/* Right annotations */}
      <aside className="pointer-events-none absolute bottom-28 right-5 z-10 hidden w-[210px] space-y-7 lg:block" style={{ top: 'auto' }}>
        <Annotation title={clock.flipped ? 'Gravure calibre' : 'Anneau calendaire'} body={clock.flipped ? 'RIPPLECIRCLE · RC-01 · SWISS MADE · Nº 0001.' : 'Repère les cycles annuels, saisonniers et hebdomadaires.'} side="right" tag={clock.flipped ? '' : ''} />
        <Annotation title={clock.flipped ? 'Rubis central' : 'Mécanisme de propagation'} body={clock.flipped ? 'Palier de synthèse, 0,24 — transmet l\'onde à tous les anneaux.' : 'Chaque changement génère une onde qui se propage à travers tout le système.'} side="right" tag={clock.flipped ? '' : 'FÉVR. · MARS'} />
        <Annotation title={clock.flipped ? 'Lecture du temps' : 'Noyau identitaire'} body={clock.flipped ? 'Lecture inversée gravée à l\'arrière — heures,minutes,secondes.' : 'Identité · Intentions · Équilibre · Alignement'} side="right" tag={clock.flipped ? '' : 'AVR. · MAI · JUIL.'} />
      </aside>

      {/* Paradigm card */}
      <div className="pointer-events-none absolute bottom-[90px] left-5 z-10 hidden w-[250px] border-[1.5px] border-black/80 bg-white/85 p-3 backdrop-blur lg:block">
        <h4 className="text-[12px] font-bold">Changement de paradigme</h4>
        <ul className="mt-2 space-y-1.5">
          {[
            'Du tableau de bord à l\'instrument vivant.',
            'Le temps, les personnes et les actions partagent une seule mécanique.',
            'Chaque changement se propage comme une onde pilotable.'
          ].map((t, i) => (
            <li key={i} className="flex gap-2 text-[10px] leading-snug text-[#444]">
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-black/80 text-[9px] not-italic">{i + 1}</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Module detail card */}
      <div className="pointer-events-none absolute bottom-[90px] right-5 z-10 hidden w-[220px] border border-black/40 bg-white/80 p-3 backdrop-blur lg:block">
        <h5 className="text-[8px] tracking-[0.2em] text-[#777]">{clock.flipped ? 'CALIBRE RC-01' : 'DÉTAIL D\'UN MODULE'}</h5>
        <div className="my-2 text-center text-[28px] leading-none">◎<br />⬢<br />⬣</div>
        <p className="text-right text-[9px] leading-[1.8] text-[#555]">
          {clock.flipped ? 'Plaque titane —\nVis cruciformes —\nCouronnes moletées —\nRubis palier —\nPoussoir F/R —' : 'Couvercle saphir —\nRotor magnétique —\nBague de guidage —\nRessort de tension —\nCorps principal —'}
        </p>
      </div>

      {/* Bottom dock */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap border border-black/80 bg-white/90 p-2 shadow-[0_12px_35px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        <button onClick={() => clock.setPlaying((p) => !p)} className={`border border-black/80 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] ${clock.playing ? 'bg-black text-white' : 'bg-white'}`}>
          {clock.playing ? '❚❚ PAUSE' : '▶ PLAY'}
        </button>
        <label className="px-1 text-[8px] font-bold tracking-[0.18em]">EXPLODED</label>
        <input type="range" min={0} max={100} value={Math.round(clock.exploded * 100)} onChange={(e) => clock.setExploded(Number(e.target.value) / 100)} className="w-[110px] accent-black" />
        <label className="px-1 text-[8px] font-bold tracking-[0.18em]">ZOOM</label>
        <div className="flex">
          <button onClick={() => clock.zoomBy(1.1)} className="w-8 border border-black/80 py-1.5 text-[14px] font-bold hover:bg-black/5">−</button>
          <button onClick={() => clock.zoomBy(0.9)} className="w-8 border border-black/80 py-1.5 text-[14px] font-bold hover:bg-black/5">+</button>
        </div>
        <button onClick={() => { clock.reset(); }} className="border border-black/80 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] hover:bg-black/5">↺ RESET VIEW</button>
        <button onClick={clock.toggleFlip} className="border border-black/80 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] hover:bg-black/5">
          {clock.flipped ? '↺ FACE' : '⇅ DOS'}
        </button>
      </div>

      {/* State pills row — visible in the topbar area (inside header row) — repositioned inside top-right of header via parent */}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-black/10 py-1.5 text-[9px] tracking-[0.08em] first:border-t-0 first:pt-0">
      <span className="text-[#666]">{label}</span>
      <b className="font-mono font-bold">{value}</b>
    </div>
  );
}

function Annotation({ title, body, side, tag }: { title: string; body: string; side: 'left' | 'right'; tag?: string }) {
  return (
    <div className="relative">
      <h3 className="border-b-[1.5px] border-black/80 pb-1.5 text-[11px] font-bold">{title}</h3>
      <p className="mt-2 text-[11px] leading-relaxed text-[#4c4b46]">{body}</p>
      {tag && <p className="mt-3 text-[10px] font-bold tracking-[0.15em]">{tag}</p>}
      <span className={`absolute top-[14px] h-px w-[52px] bg-black/80 ${side === 'left' ? '-right-[58px] origin-left -rotate-[18deg]' : '-left-[58px] origin-right rotate-[18deg]'}`} />
    </div>
  );
}
