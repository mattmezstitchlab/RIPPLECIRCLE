import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Camera,
  Clock3,
  Layers,
  Music2,
  Users,
  BellRing,
  Network,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  INTERESTS,
  INTEREST_BY_ID,
  NET_BY_ID,
  NET_GUESTS,
  NET_TABLES,
  NetGuest,
  TABLE_OF,
  TEAM_GROUP,
  sharedInterests,
  synergyOf
} from '../../data/networking';
import { guestPhoto } from '../../data/guestStories';
import { BASE_TRACKS, SETS, Track, schedule } from '../../data/playlist';
import { DAY_MOMENTS, DayRole } from '../../data/dayOf';
import { MEMORIES, MEDIA_TYPE_META } from '../../data/memory';
import { DOCS, euro, totalsOf } from '../../data/documents';
import { ROLES } from '../../data/roles';
import type { AccountState, JourneyMilestone } from '../../data/account';
import { DocSheet } from './DocSheet';
import { ActionPanel } from './ActionPanel';
import { AudioPreview } from './AudioPreview';
import { ClockDial } from './ClockDial';
import { InstantInspector } from './InstantInspector';
import { PublicIncidentDemo } from './PublicIncidentDemo';
import { PublicAftermathDemo } from './PublicAftermathDemo';
import { type PublicMode, type RepairId } from '../../utils/publicSimulation';
import { angleAtMinute, minuteAtAngle, momentAt, causalDemoLinks, rolesForPublicIncident, shouldShowPublicCascade, START_MINUTE, END_MINUTE } from '../../utils/publicTimeline';
import { Scene } from '../../data/orchestra';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useReactiveOrchestra } from '../../engine/orchestra/useReactiveOrchestra';
import { END as ORCH_END, START as ORCH_START } from '../../hooks/useOrchestra';
import { minutesFrom17ToTime, timeToMinutesFrom17 } from '../../utils/time';
import { angularDist, arcPathAt, normDeg, polarXY } from '../../utils/radial';
import { sfx } from '../../utils/audio';
import { LIFECYCLE_META } from '../../engine/orchestra/types';
import {
  RIPPLE_SIZE as SIZE,
  RIPPLE_CENTER as C,
  RINGS as R,
  RING_GAP,
  GROUP_COLORS,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  PAN_MAX,
  ACCENTS
} from '../../ripple/config';

/*
 * Ripple — Cadran concentrique haute accessibilité & lisibilité
 * Toutes les informations au pixel près, avec typographie agrandie,
 * avatars haute définition, contrôles de zoom / pan et modes de taille confort.
 *
 * Phase 1 stabilization: chord rendering, wheel zoom, unique clip-path ids,
 * audio mute toggle, connection-state indicator, CSS-variable theming.
 */

const INK = ACCENTS.ink;
const MUTED = ACCENTS.muted;
const BODY = ACCENTS.body;

const polar = (r: number, deg: number) => polarXY(C, C, r, deg);
const arcPath = (r: number, a0: number, a1: number) => arcPathAt(C, C, r, a0, a1);

/** Build a stable SVG path for a chord between two points on the people ring. */
const chordPath = (a: number, b: number): string => {
  const pa = polar(R.chord, a);
  const pb = polar(R.chord, b);
  // Quadratic control point pulled toward the center to curve inside the disk.
  const mid = normDeg((a + b) / 2 + (Math.abs(a - b) > 180 ? 180 : 0));
  const cp = polar(R.chord * 0.45, mid);
  return `M ${pa.x} ${pa.y} Q ${cp.x} ${cp.y} ${pb.x} ${pb.y}`;
};

const DAY_START = timeToMinutesFrom17('15:00');
const DAY_SPAN = timeToMinutesFrom17('05:00') - DAY_START;
const timeAngle = (m: number) => ((m - DAY_START) / DAY_SPAN) * 360;
const fmt = minutesFrom17ToTime;

/* ------------------------------ Calendrier ------------------------------ */

const YEAR = 2026;
const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
const SEASON_OF = ['#0A84FF', '#0A84FF', '#1E7A39', '#1E7A39', '#1E7A39', '#E6A100', '#E6A100', '#E6A100', '#D96B00', '#D96B00', '#D96B00', '#0A84FF'];
const YEAR_DAYS = 365;
const dayOfYear = (d: Date) => Math.round((d.getTime() - new Date(YEAR, 0, 1).getTime()) / 86400000);
const dayAngle = (doy: number) => (doy / YEAR_DAYS) * 360;
const DAY_J_DATE = new Date(YEAR, 9, 11);
const DAY_J_DOY = dayOfYear(DAY_J_DATE);
const MONTH_START = Array.from({ length: 12 }, (_, m) => dayOfYear(new Date(YEAR, m, 1)));
const CAL_MARKERS = [
  { offset: -90, label: 'J-90', detail: 'Contrats signés, budget arrêté' },
  { offset: -60, label: 'J-60', detail: 'Plan de table — première version' },
  { offset: -30, label: 'J-30', detail: 'Plan de table figé, menus validés' },
  { offset: -14, label: 'J-14', detail: 'Relance fournisseurs' },
  { offset: -7, label: 'J-7', detail: 'Briefing prestataires' },
  { offset: -2, label: 'J-2', detail: 'Répétition de la cérémonie' },
  { offset: 0, label: 'Jour J', detail: 'Le mariage — Domaine de Chantilly' }
];

/* ------------------------------- Personnes ------------------------------- */

const GROUPS = [...NET_TABLES, TEAM_GROUP];
const ORDER = GROUPS.flatMap((g) => g.guests);
const GROUP_GAP = 5;
const STEP = (360 - GROUP_GAP * GROUPS.length) / ORDER.length;
const ANGLE: Record<string, number> = {};
const GROUP_ARC: { id: string; name: string; a0: number; a1: number; color: string; n: number }[] = [];
{
  let a = GROUP_GAP / 2;
  GROUPS.forEach((g, i) => {
    const a0 = a;
    g.guests.forEach((id) => {
      ANGLE[id] = a + STEP / 2;
      a += STEP;
    });
    GROUP_ARC.push({ id: g.id, name: g.name.replace('Table ', ''), a0, a1: a, color: GROUP_COLORS[i], n: g.guests.length });
    a += GROUP_GAP;
  });
}
const JOURNEY_COLORS: Record<string, string> = {
  naissance: '#FF375F',
  etudes: '#0A84FF',
  diplome: '#1E7A39',
  travail: '#D96B00',
  personnel: '#BF5AF2',
  autre: '#8e8e93'
};

const LINKS: { a: string; b: string; why: string }[] = [];
for (let i = 0; i < ORDER.length; i++)
  for (let j = i + 1; j < ORDER.length; j++) {
    const why = synergyOf(NET_BY_ID[ORDER[i]], NET_BY_ID[ORDER[j]]);
    if (why) LINKS.push({ a: ORDER[i], b: ORDER[j], why });
  }

const nearestPerson = (deg: number) => {
  let best = ORDER[0];
  let d = Infinity;
  ORDER.forEach((id) => {
    const x = angularDist(ANGLE[id], deg);
    if (x < d) {
      d = x;
      best = id;
    }
  });
  return best;
};

const fullName = (p?: NetGuest) => (p ? `${p.first} ${p.last}` : 'Équipe logistique');
const dayRoleOf = (p: NetGuest): DayRole => (p.roleId as DayRole) ?? 'invite';

/** Fiche d'une personne avec les modifications du compte appliquées. */
const personRecord = (account: AccountState, id: string): NetGuest => {
  const base = NET_BY_ID[id];
  if (!base || id !== account.profileId) return base;
  return {
    ...base,
    first: account.first,
    last: account.last,
    job: account.job,
    company: account.company,
    sector: account.sector,
    interests: account.interests,
    seeking: account.seeking,
    photo: account.avatarUrl || base.photo
  };
};

const photoOf = (account: AccountState, id: string) =>
  id === account.profileId && account.avatarUrl ? account.avatarUrl : guestPhoto(id);



/* --------------------------------- Types --------------------------------- */

export type RippleLayer = 'overview' | 'calendar' | 'journey' | 'day' | 'memory' | 'playlist' | 'people';

const ORBIT: { id: RippleLayer; label: string; color: string; icon: React.ElementType; hash: string }[] = [
  { id: 'overview', label: 'Causalité', color: '#FF9F0A', icon: Layers, hash: '' },
  { id: 'calendar', label: 'Calendrier', color: '#0A84FF', icon: CalendarDays, hash: 'calendar' },
  { id: 'journey', label: 'Parcours', color: '#BF5AF2', icon: Clock3, hash: 'journey' },
  { id: 'day', label: 'Moments du jour J', color: '#FF453A', icon: Clock3, hash: 'day' },
  { id: 'memory', label: 'Souvenirs', color: '#30D158', icon: Camera, hash: 'memory' },
  { id: 'playlist', label: 'Musique', color: '#5E5CE6', icon: Music2, hash: 'playlist' },
  { id: 'people', label: 'Personnes et relations', color: '#0A84FF', icon: Users, hash: 'people' }
];

type Focus =
  | { kind: 'person'; id: string }
  | { kind: 'moment'; id: string }
  | { kind: 'track'; id: string }
  | { kind: 'memory'; id: string }
  | { kind: 'day'; doy: number }
  | { kind: 'journey'; id: string };

interface RippleProps {
  activeLayer: RippleLayer;
  account: AccountState;
  minutes: number;
  paused: boolean;
  manual: boolean;
  scene: Scene | null;
  slack: number;
  stability: number;
  onScrub: (minute: number) => void;
  onToggle: () => void;
  onResume: () => void;
}

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
    {children}
  </p>
);

export const Ripple: React.FC<RippleProps> = ({
  activeLayer,
  account,
  minutes,
  paused,
  manual,
  scene,
  slack,
  stability,
  onScrub,
  onToggle,
  onResume
}) => {
  const reduceMotion =
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [angle, setAngle] = useState(ANGLE[ORDER[0]]);
  const [turning, setTurning] = useState(false);
  const [focus, setFocus] = useState<Focus>({ kind: 'moment', id: 'd7' });
  const [exploreMinute, setExploreMinute] = useState(timeToMinutesFrom17('21:08'));
  const [followDemo, setFollowDemo] = useState(false);
  const draggingTime = useRef(false);
  const [publicMode, setPublicMode] = useState<PublicMode>('observe');
  const [publicDelay, setPublicDelay] = useState(10);
  const [publicPlan, setPublicPlan] = useState<RepairId | null>(null);

  // Per-instance unique id for SVG clipPaths (avoids collisions if multiple Ripple instances mount).

  // Audio mute — persisted, defaults to muted when user prefers reduced motion.
  const [audioMuted, setAudioMuted] = usePersistentState<boolean>(
    'regie.audio.v1',
    reduceMotion
  );
  useEffect(() => {
    sfx.enabled = !audioMuted;
  }, [audioMuted]);

  // Zoom & Pan state
  const [relationsVisible, setRelationsVisible] = useState(true);
  const [relationPulse, setRelationPulse] = useState(0);
  const audioPulseRef = useRef<SVGCircleElement | null>(null);
  const onAudioLevel = useCallback((level: number) => {
    const ring = audioPulseRef.current;
    if (!ring) return;
    ring.setAttribute('stroke-width', level > 0 ? (2 + level * 19).toFixed(1) : '0');
    ring.setAttribute('opacity', level > 0 ? (0.28 + level * 0.65).toFixed(2) : '0');
  }, []);

  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Normal is the default and only text size. Zoom is spatial, not typographic.
  const fontMult = 1;

  const [compact, setCompact] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingNeedle = useRef(false);
  const panning = useRef(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  const [added] = usePersistentState<Track[]>('regie.playlist.added.v1', []);
  const tracks = useMemo(() => schedule([...BASE_TRACKS, ...added]), [added]);

  // Reactive orchestration engine (Phase 1 vertical slice — local, demo).
  const engine = useReactiveOrchestra();
  const memories = useMemo(() => MEMORIES.map((m) => ({ ...m, t: timeToMinutesFrom17(m.at) })), []);
  const nowTrack = tracks.find((t) => exploreMinute >= t.start && exploreMinute < t.end) ?? null;
  const nextSignal = tracks.find((t) => t.signal && t.start > exploreMinute) ?? null;
  const activeMoment = momentAt(exploreMinute);
  const publicCascadeActive = shouldShowPublicCascade(exploreMinute);
  const live = !paused && !manual;

  // L'identité du compte est la source de vérité du profil sélectionné dans le graphe.
  const personData = useMemo(() => {
    const base = NET_BY_ID[account.profileId];
    if (!base) return NET_BY_ID;
    return {
      ...NET_BY_ID,
      [account.profileId]: {
        ...base,
        first: account.first,
        last: account.last,
        job: account.job,
        company: account.company,
        sector: account.sector,
        interests: account.interests,
        seeking: account.seeking,
        photo: account.avatarUrl || base.photo
      }
    };
  }, [account]);

  const impactedPeopleIds = publicCascadeActive
    ? rolesForPublicIncident().flatMap(role =>
        ORDER.filter(id => dayRoleOf(personData[id]) === role).slice(0, role === 'invite' ? 2 : 1))
    : [];

  const publicJourney = account.journey.filter((milestone) => milestone.shared);
  const journeyStartDate = useMemo(() => {
    const birth = account.journey.find((milestone) => milestone.kind === 'naissance');
    return new Date(`${birth?.date ?? account.journey[0]?.date ?? '1993-01-01'}T12:00:00`);
  }, [account.journey]);
  const journeyEndDate = DAY_J_DATE;
  const journeySpan = Math.max(1, journeyEndDate.getTime() - journeyStartDate.getTime());
  const journeyAngle = (milestone: JourneyMilestone) => {
    const date = new Date(`${milestone.date}T12:00:00`);
    return Math.max(0, Math.min(359.9, ((date.getTime() - journeyStartDate.getTime()) / journeySpan) * 360));
  };

  const journeyMilestone = (id: string) => account.journey.find((milestone) => milestone.id === id) ?? null;
  const graphLinks = useMemo(() => {
    const links = LINKS.filter((link) => link.a !== account.profileId && link.b !== account.profileId);
    const profile = personData[account.profileId];
    if (profile) {
      ORDER.forEach((id) => {
        if (id === account.profileId) return;
        const why = synergyOf(profile, personData[id]);
        if (why) links.push({ a: profile.id, b: id, why });
      });
    }
    return links;
  }, [account.profileId, personData]);

  const relationLinks = graphLinks;

  // Responsive compact check
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (followDemo) {
      setExploreMinute(minutes);
      setFocus({ kind: 'moment', id: momentAt(minutes).id });
    }
  }, [minutes, followDemo]);

  // Layer change focus synchronization
  useEffect(() => {
    setTurning(false);
    if (activeLayer === 'people') {
      setFocus((f) => (f.kind === 'person' ? f : { kind: 'person', id: account.profileId }));
    } else if (activeLayer === 'calendar') setFocus({ kind: 'day', doy: DAY_J_DOY });
    else if (activeLayer === 'journey') {
      const first = publicJourney[0];
      setFocus(first ? { kind: 'journey', id: first.id } : { kind: 'person', id: account.profileId });
    } else if (activeLayer === 'day') {
      setFocus({ kind: 'moment', id: momentAt(exploreMinute).id });
    } else if (activeLayer === 'memory') setFocus({ kind: 'memory', id: memories[0].id });
    else if (activeLayer === 'playlist') setFocus({ kind: 'track', id: (nowTrack ?? tracks[0]).id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayer]);

  // Needle automated rotation
  useEffect(() => {
    if (!turning) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      setAngle((a) => normDeg(a + (dt / 90000) * 360));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [turning]);

  const needlePerson = nearestPerson(angle);
  useEffect(() => {
    if (turning) setFocus((f) => (f.kind === 'person' && f.id === needlePerson ? f : { kind: 'person', id: needlePerson }));
  }, [needlePerson, turning]);

  const chooseInstant = (value: number) => {
    const minute = Math.max(START_MINUTE, Math.min(END_MINUTE, Math.round(value)));
    setFollowDemo(false);
    setTurning(false);
    setExploreMinute(minute);
    setFocus({ kind: 'moment', id: momentAt(minute).id });
  };

  const choose = (f: Focus) => {
    sfx.playNodeClick();
    setTurning(false);
    setFocus(f);
    if (f.kind === 'person') {
      setAngle(ANGLE[f.id]);
      setRelationPulse((n) => n + 1);
    } else if (f.kind === 'moment') {
      const selected = DAY_MOMENTS.find(m => m.id === f.id);
      if (selected) { setFollowDemo(false); setExploreMinute(timeToMinutesFrom17(selected.at)); }
    } else if (f.kind === 'track') {
      const selected = tracks.find(t => t.id === f.id);
      if (selected) { setFollowDemo(false); setExploreMinute(selected.start); }
    } else if (f.kind === 'memory') {
      const selected = memories.find(m => m.id === f.id);
      if (selected) { setFollowDemo(false); setExploreMinute(selected.t); }
    }
  };

  /* ------------- Cross-layer link highlighting ------------- */

  const related = useMemo(() => {
    const people = new Set<string>();
    const tracksOn = new Set<string>();
    const memoriesOn = new Set<string>();
    const momentsOn = new Set<string>();
    let days = new Set<number>([DAY_J_DOY]);

    if (focus.kind === 'person') {
      const p = personData[focus.id];
      people.add(p.id);
      relationLinks.forEach((l) => {
        if (l.a === p.id) people.add(l.b);
        if (l.b === p.id) people.add(l.a);
      });
      tracks.forEach((t) => t.by === p.id && tracksOn.add(t.id));
      memories.forEach((m) => m.author === p.id && memoriesOn.add(m.id));
      const role = dayRoleOf(p);
      DAY_MOMENTS.forEach((m) => m.roles.includes(role) && momentsOn.add(m.id));
    } else if (focus.kind === 'moment') {
      const mo = DAY_MOMENTS.find((m) => m.id === focus.id);
      if (mo) {
        momentsOn.add(mo.id);
        const start = timeToMinutesFrom17(mo.at);
        const next = DAY_MOMENTS[DAY_MOMENTS.indexOf(mo) + 1];
        const end = next ? timeToMinutesFrom17(next.at) : start + 60;
        ORDER.forEach((id) => mo.roles.includes(dayRoleOf(personData[id])) && people.add(id));
        tracks.forEach((t) => t.start < end && t.end > start && tracksOn.add(t.id));
        memories.forEach((m) => m.t >= start && m.t < end && memoriesOn.add(m.id));
      }
    } else if (focus.kind === 'track') {
      const t = tracks.find((x) => x.id === focus.id);
      if (t) {
        tracksOn.add(t.id);
        people.add(t.by);
        memories.forEach((m) => m.t >= t.start - 4 && m.t < t.end + 4 && memoriesOn.add(m.id));
        DAY_MOMENTS.forEach((m) => {
          const a = timeToMinutesFrom17(m.at);
          if (a >= t.start - 2 && a < t.end + 2) momentsOn.add(m.id);
        });
      }
    } else if (focus.kind === 'memory') {
      const m = memories.find((x) => x.id === focus.id);
      if (m) {
        memoriesOn.add(m.id);
        if (personData[m.author]) people.add(m.author);
        tracks.forEach((t) => m.t >= t.start && m.t < t.end && tracksOn.add(t.id));
        let last: string | null = null;
        DAY_MOMENTS.forEach((d) => timeToMinutesFrom17(d.at) <= m.t && (last = d.id));
        if (last) momentsOn.add(last);
      }
    } else if (focus.kind === 'day') {
      days = new Set([focus.doy]);
      if (focus.doy === DAY_J_DOY) DAY_MOMENTS.forEach((m) => m.cle && momentsOn.add(m.id));
    } else if (focus.kind === 'journey') {
      const milestone = journeyMilestone(focus.id);
      if (milestone) {
        people.add(account.profileId);
        const date = new Date(`${milestone.date}T12:00:00`);
        if (date.getFullYear() === YEAR) days = new Set([dayOfYear(date)]);
      }
    }
    return { people, tracksOn, memoriesOn, momentsOn, days };
  }, [focus, tracks, memories, personData, relationLinks, account.profileId]);

  /* ------------------------- Couches : visibilité ------------------------- */

  const overview = activeLayer === 'overview';
  const show = (layer: Exclude<RippleLayer, 'overview'>) => {
    return compact ? layer === activeLayer || ((overview || activeLayer === 'playlist') && (layer === 'people' || layer === 'playlist' || layer === 'day')) : true;
  };
  const emphasis = (_layer: Exclude<RippleLayer, 'overview'>) => 1;
  const interactive = (layer: Exclude<RippleLayer, 'overview'>) => overview || layer === activeLayer;

  /* ----------------------------- Zoom / Pan Geometry ----------------------------- */

  const viewBoxStr = useMemo(() => {
    const effectiveSpan = (SIZE + 60) / zoom;
    const minX = C - effectiveSpan / 2 + pan.x;
    const minY = C - effectiveSpan / 2 + pan.y;
    return `${minX} ${minY} ${effectiveSpan} ${effectiveSpan}`;
  }, [zoom, pan]);

  const handleZoom = (delta: number, cx?: number, cy?: number) => {
    sfx.playBlip(delta > 0 ? 1100 : 750, 0.02);
    setZoom((z) => {
      const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number((z + delta).toFixed(2))));
      // When wheel-zooming on a point, keep that point anchored by adjusting pan.
      if (cx !== undefined && cy !== undefined && Math.abs(delta) > 0.001) {
        const scale = next / z;
        setPan((p) => ({
          x: cx - (cx - p.x) * scale,
          y: cy - (cy - p.y) * scale
        }));
      }
      return next;
    });
  };

  const resetView = () => {
    sfx.playNodeClick();
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const angleFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const effectiveSpan = (SIZE + 60) / zoom;
    const svgX = (C - effectiveSpan / 2 + pan.x) + ((e.clientX - r.left) / r.width) * effectiveSpan;
    const svgY = (C - effectiveSpan / 2 + pan.y) + ((e.clientY - r.top) / r.height) * effectiveSpan;
    const dx = svgX - C;
    const dy = svgY - C;
    return { a: normDeg((Math.atan2(dy, dx) * 180) / Math.PI + 90), d: Math.hypot(dx, dy) };
  };

  // Keyboard navigation through items
  const stepFocus = (dir: 1 | -1) => {
    sfx.playBlip(dir > 0 ? 980 : 820, 0.02);
    setTurning(false);
    if (activeLayer === 'overview' || activeLayer === 'day') {
      chooseInstant(exploreMinute + dir * 5);
    } else if (activeLayer === 'calendar') {
      const idx = CAL_MARKERS.findIndex((m) => focus.kind === 'day' && DAY_J_DOY + m.offset === focus.doy);
      const next = CAL_MARKERS[(idx + dir + CAL_MARKERS.length) % CAL_MARKERS.length];
      setFocus({ kind: 'day', doy: DAY_J_DOY + next.offset });
    } else if (activeLayer === 'journey') {
      const idx = publicJourney.findIndex((m) => focus.kind === 'journey' && m.id === focus.id);
      const next = publicJourney[(Math.max(idx, 0) + dir + publicJourney.length) % publicJourney.length];
      if (next) setFocus({ kind: 'journey', id: next.id });
    } else if (activeLayer === 'memory') {
      const idx = memories.findIndex((m) => focus.kind === 'memory' && m.id === focus.id);
      setFocus({ kind: 'memory', id: memories[(Math.max(idx, 0) + dir + memories.length) % memories.length].id });
    } else if (activeLayer === 'playlist') {
      const idx = tracks.findIndex((t) => focus.kind === 'track' && t.id === focus.id);
      setFocus({ kind: 'track', id: tracks[(Math.max(idx, 0) + dir + tracks.length) % tracks.length].id });
    } else {
      const idx = ORDER.findIndex((id) => focus.kind === 'person' && id === focus.id);
      const next = ORDER[(Math.max(idx, 0) + dir + ORDER.length) % ORDER.length];
      setFocus({ kind: 'person', id: next });
      setAngle(ANGLE[next]);
    }
  };

  /* -------------------------------- Rendu -------------------------------- */

  const nowAngle = angleAtMinute(exploreMinute);
  const causalHighlight = publicMode !== 'observe' || publicCascadeActive;
  const person = focus.kind === 'person' ? personData[focus.id] : null;
  const moment = focus.kind === 'moment' ? DAY_MOMENTS.find((m) => m.id === focus.id) ?? null : null;
  const track = focus.kind === 'track' ? tracks.find((t) => t.id === focus.id) ?? null : null;
  const media = focus.kind === 'memory' ? memories.find((m) => m.id === focus.id) ?? null : null;
  const dayFocus = focus.kind === 'day' ? focus.doy : null;
  const journeySel = focus.kind === 'journey' ? journeyMilestone(focus.id) : null;
  const personLinks = person ? relationLinks.filter((l) => l.a === person.id || l.b === person.id) : [];
  const scrubValue = Math.max(ORCH_START, Math.min(ORCH_END, minutes));
  const focusTitle = person ? fullName(person) : moment ? moment.title : track ? track.title
    : media ? media.legend : journeySel ? journeySel.title : dayFocus !== null
      ? new Date(YEAR,0,dayFocus+1).toLocaleDateString('fr-FR',{ day:'numeric',month:'long' })
      : activeMoment.title;
  const activePeople = [...new Set(activeMoment.roles
    .map(role => ORDER.find(id => dayRoleOf(personData[id]) === role))
    .filter((id): id is string => Boolean(id)))].map(id => personData[id].first);

  return (
    <main className="max-w-[1680px] mx-auto px-4 sm:px-6 pt-3 pb-5">
      <div className="ripple-public-hero" aria-label="Explorer un imprévu fictif">
        <div className="ripple-public-hero-copy">
          <p className="ripple-public-kicker">RIPPLECIRCLE · Démonstration</p>
          <h1>Quand un détail change, voyez tout ce qu’il entraîne.</h1>
          <p>Simulez les effets, remontez une chaîne explicative et comparez des plans B sur un mariage fictif.</p>
        </div>
        <div className="ripple-public-hero-actions" role="group" aria-label="Actions de démonstration">
          {([
            { id:'simulate', label:'Simuler un imprévu' },
            { id:'trace', label:'Trouver la première cause' },
            { id:'repair', label:'Réparer le planning' }
          ] as const).map(action => (
            <button type="button" key={action.id} className="ripple-hero-cta"
              aria-pressed={publicMode === action.id}
              onClick={() => {
                setPublicMode(action.id);
                setFollowDemo(false);
                setTurning(false);
                setExploreMinute(timeToMinutesFrom17('21:08'));
                setFocus({ kind:'moment',id:'d7' });
                setPublicPlan(null);
              }}>{action.label}</button>
          ))}
          {publicMode!=='observe' && <button type="button" className="ripple-hero-reset"
            onClick={() => {setPublicMode('observe');setPublicPlan(null);}}>Fermer</button>}
        </div>
      </div>
      {/* Un instrument central : les vues se choisissent autour du cadran. */}
      <div className="ripple-stage">
        <div className="ripple-watch-column">
          <nav className="ripple-orbit-nav" aria-label="Couches du cadran">
            {ORBIT.map(item => {
              const Icon = item.icon;
              const selected = activeLayer === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="ripple-orbit-button"
                  aria-label={item.label}
                  aria-current={selected ? 'page' : undefined}
                  title={item.label}
                  onClick={() => {
                    if (selected) return;
                    sfx.playNodeClick();
                    window.location.hash = item.hash;
                  }}
                  style={{ '--orbit-accent': item.color } as React.CSSProperties}
                >
                  <Icon className="w-5 h-5" />
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="ripple-watch-wrap">
        <div
          className="relative w-full mx-auto aspect-square outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/50 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          style={{ background: 'var(--ripple-surface, #ffffff)' }}
          tabIndex={0}
          role="application"
          aria-label={`Cercle Ripple 2D — couche active : ${activeLayer}. Flèches gauche et droite pour naviguer, plus et moins pour zoomer.`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              stepFocus(1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              stepFocus(-1);

            } else if (e.key === '+' || e.key === '=') {
              e.preventDefault();
              handleZoom(0.2);
            } else if (e.key === '-') {
              e.preventDefault();
              handleZoom(-0.2);
            } else if (e.key === '0') {
              e.preventDefault();
              resetView();
            }
          }}
        >
          <svg
            ref={svgRef}
            viewBox={viewBoxStr}
            className="absolute inset-0 w-full h-full overflow-visible select-none"
            style={{ touchAction: 'pan-y', msTouchAction: 'pan-y' }}
            aria-hidden="true"
            onPointerDown={(e) => {
              const p = angleFromEvent(e);
              if (!p) return;
              if (p.d >= R.hours - 18 && p.d <= R.hours + 18) {
                e.preventDefault();
                draggingTime.current = true;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                chooseInstant(minuteAtAngle(p.a));
                return;
              }
              // If zoomed in and touching background, enable Pan
              if (zoom > 1.05 && (p.d > R.calOuter + 30 || p.d < R.ring0 - 40)) {
                panning.current = true;
                panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
                (e.target as Element).setPointerCapture?.(e.pointerId);
                return;
              }
              if (!interactive('people') || p.d > R.people + 40 || p.d < R.ring0 - 30) return;
              draggingNeedle.current = true;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setTurning(false);
              setAngle(p.a);
              setFocus({ kind: 'person', id: nearestPerson(p.a) });
            }}
            onWheel={(e) => {
              // Zoom roue/pinch UNIQUEMENT quand Ctrl ou Cmd est enfoncé
              // (ce qui correspond au geste standard "pincer" du trackpad,
              // signalé par les navigateurs comme wheel+ctrlKey).
              // Un défilement trackpad normal NE DOIT PAS zoomer et doit
              // laisser la page défiler — aucun preventDefault dans ce cas.
              if (!(e.ctrlKey || e.metaKey)) return;
              e.preventDefault();
              // Éviter les sauts de zoom massifs sur trackpad : deltaY est
              // exprimé en pixels (souvent 4-40) ; on divise par 100 puis par
              // ZOOM_STEP pour obtenir un incrément raisonnable.
              const raw = -e.deltaY;
              const norm = Math.max(-ZOOM_STEP * 2, Math.min(ZOOM_STEP * 2, raw / 100));
              if (Math.abs(norm) < 0.02) return;
              const r = svgRef.current?.getBoundingClientRect();
              if (r) {
                const cx = ((e.clientX - r.left) / r.width - 0.5) * (SIZE + 60);
                const cy = ((e.clientY - r.top) / r.height - 0.5) * (SIZE + 60);
                handleZoom(norm, cx, cy);
              } else {
                handleZoom(norm);
              }
            }}
            onPointerMove={(e) => {
              if (draggingTime.current) {
                const p = angleFromEvent(e);
                if (p) chooseInstant(minuteAtAngle(p.a));
                return;
              }
              if (panning.current) {
                const dx = (e.clientX - panStart.current.x) * ((SIZE + 60) / zoom / 600);
                const dy = (e.clientY - panStart.current.y) * ((SIZE + 60) / zoom / 600);
                setPan({
                  x: Math.max(-PAN_MAX, Math.min(PAN_MAX, panStart.current.panX - dx)),
                  y: Math.max(-PAN_MAX, Math.min(PAN_MAX, panStart.current.panY - dy))
                });
                return;
              }
              if (!draggingNeedle.current) return;
              const p = angleFromEvent(e);
              if (p) {
                setAngle(p.a);
                setFocus({ kind: 'person', id: nearestPerson(p.a) });
              }
            }}
            onPointerUp={() => {
              draggingTime.current = false;
              if (panning.current) panning.current = false;
              if (draggingNeedle.current) {
                draggingNeedle.current = false;
                setAngle(ANGLE[nearestPerson(angle)]);
                sfx.playBlip(980, 0.02);
              }
            }}
            onPointerCancel={() => {
              draggingTime.current = false;
              panning.current = false;
              draggingNeedle.current = false;
            }}
          >
            {/* Background base guide rings */}
            <circle cx={C} cy={C} r={R.calOuter} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
            <circle cx={C} cy={C} r={R.calInner} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />

            {/* ---------- 1. Calendrier Annuel Agrandit ---------- */}
            {show('calendar') && (
              <g opacity={emphasis('calendar')} pointerEvents={interactive('calendar') ? 'auto' : 'none'}>
                {MONTHS.map((label, m) => {
                  const a0 = dayAngle(MONTH_START[m]);
                  const a1 = dayAngle(m === 11 ? YEAR_DAYS : MONTH_START[m + 1]);
                  const mid = polar(R.calOuter + 18 * fontMult, (a0 + a1) / 2);
                  const isOct = m === 9;
                  return (
                    <g key={label}>
                      <path
                        d={arcPath((R.calOuter + R.calInner) / 2, a0 + 0.4, a1 - 0.4)}
                        fill="none"
                        stroke={SEASON_OF[m]}
                        strokeWidth={R.calOuter - R.calInner}
                        opacity={isOct ? 0.65 : 0.3}
                      />
                      <text
                        x={mid.x}
                        y={mid.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14 * fontMult}
                        fontWeight={isOct ? 800 : 700}
                        fill={isOct ? INK : MUTED}
                        style={{ paintOrder: 'stroke' }}
                        stroke="var(--ripple-surface, #ffffff)"
                        strokeWidth={3}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Day ticks with clear clickable targets */}
                {Array.from({ length: YEAR_DAYS }, (_, d) => {
                  const a = dayAngle(d + 0.5);
                  const p1 = polar(R.calInner + 1, a);
                  const p2 = polar(R.calOuter - 1, a);
                  const on = related.days.has(d);
                  return (
                    <line
                      key={d}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={on ? INK : '#fff'}
                      strokeWidth={on ? 3.5 : 1.2}
                      opacity={on ? 1 : 0.85}
                      className="cursor-pointer"
                      onClick={() => choose({ kind: 'day', doy: d })}
                    >
                      <title>{new Date(YEAR, 0, d + 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</title>
                    </line>
                  );
                })}

                {/* Preparation markers */}
                {CAL_MARKERS.map((mk) => {
                  const doy = DAY_J_DOY + mk.offset;
                  const p = polar(R.calInner - 12, dayAngle(doy + 0.5));
                  const isJ = mk.offset === 0;
                  return (
                    <g key={mk.label} className="cursor-pointer" onClick={() => choose({ kind: 'day', doy })}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={(isJ ? 10 : 6.5) * fontMult}
                        fill={isJ ? INK : '#D96B00'}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                      {isJ && (
                        <text
                          x={p.x}
                          y={p.y + 0.5}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={9 * fontMult}
                          fontWeight="800"
                          fill="#fff"
                        >
                          J
                        </text>
                      )}
                      <title>{`${mk.label} · ${mk.detail}`}</title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ---------- Parcours de vie (naissance → Jour J) ---------- */}
            {show('journey') && (
              <g opacity={1} pointerEvents={interactive('journey') ? 'auto' : 'none'}>
                <circle
                  cx={C}
                  cy={C}
                  r={(R.lifeOuter + R.lifeInner) / 2}
                  fill="none"
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth={2}
                />
                {publicJourney.map((m) => {
                  const p = polar((R.lifeOuter + R.lifeInner) / 2, journeyAngle(m));
                  const on = focus.kind === 'journey' && focus.id === m.id;
                  return (
                    <g key={m.id} className="cursor-pointer" onClick={() => choose({ kind: 'journey', id: m.id })}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={on ? 9 : 6}
                        fill={JOURNEY_COLORS[m.kind] ?? '#8e8e93'}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                      <title>{`${m.date} · ${m.title} — ${m.detail}`}</title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ---------- Échelle horaire 15:00 → 05:00 (Agrandie & Pill badges) ---------- */}
            {(show('day') || show('memory') || show('playlist')) && (
              <g>
                <circle cx={C} cy={C} r={R.hours} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
                {Array.from({ length: 15 }, (_, i) => DAY_START + i * 60).map((m) => {
                  const a = timeAngle(m);
                  const p = polar(R.hours, a);
                  const t1 = polar(R.hours - 8, a);
                  const t2 = polar(R.hours + 6, a);
                  const isMajor = (m - DAY_START) % 120 === 0;
                  return (
                    <g key={m}>
                      <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={INK} strokeWidth={isMajor ? 1.8 : 1.0} opacity={0.35} />
                      {isMajor && (
                        <g>
                          <rect
                            x={p.x - 22 * fontMult}
                            y={p.y - 10 * fontMult}
                            width={44 * fontMult}
                            height={20 * fontMult}
                            rx={10 * fontMult}
                            fill="var(--ripple-surface, #ffffff)"
                            stroke="var(--ripple-line, rgba(0,0,0,0.12))"
                            strokeWidth={1}
                          />
                          <text
                            x={p.x}
                            y={p.y + 0.5}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={12 * fontMult}
                            fontWeight="800"
                            fill={INK}
                          >
                            {fmt(m)}
                          </text>
                        </g>
                             )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* ---------- 2. Jour J (Moments forts) ---------- */}
            {show('day') && (
              <g opacity={emphasis('day')} pointerEvents={interactive('day') ? 'auto' : 'none'}>
                <circle cx={C} cy={C} r={R.day} fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth={2} />
                {DAY_MOMENTS.map((m, i) => {
                  const a0 = timeAngle(timeToMinutesFrom17(m.at));
                  const next = DAY_MOMENTS[i + 1];
                  const a1 = next ? timeAngle(timeToMinutesFrom17(next.at)) : 360;
                  const on = related.momentsOn.has(m.id);
                  const inPath = causalHighlight && ['d7','d9','d10','d14','d15'].includes(m.id);
                  const p = polar(R.day, a0);
                  const nodeR = (m.cle || m.retard ? 8.5 : 5.5) * fontMult;
                  return (
                    <g
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => choose({ kind: 'moment', id: m.id })}
                      style={{ opacity: 1 }}
                    >
                      <path
                        d={arcPath(R.day, a0 + 0.6, a1 - 0.6)}
                        fill="none"
                        stroke={m.retard ? '#FF453A' : m.cle ? INK : '#b0b0b5'}
                        strokeWidth={inPath ? 11 : on ? 9 : 5}
                        strokeLinecap="round"
                      />
                      {inPath && <circle cx={p.x} cy={p.y} r={nodeR+11} fill="none"
                        stroke={m.id === 'd7' ? '#FF9F0A' : '#FF453A'} strokeWidth={2} className="ripple-causal-node" />}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={nodeR}
                        fill={m.retard ? '#FF453A' : '#fff'}
                        stroke={m.retard ? '#fff' : INK}
                        strokeWidth={2}
                      />
                      {m.retard && (
                        <text
                          x={p.x}
                          y={p.y + 0.5}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={9 * fontMult}
                          fontWeight="900"
                          fill="#fff"
                        >
                          !
                        </text>
                      )}
                      <title>{`${m.at} · ${m.title} — ${m.lieu}`}</title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ---------- 3. Memory (Vignettes Photos HD) ---------- */}
            {show('memory') && (
              <g opacity={emphasis('memory')} pointerEvents={interactive('memory') ? 'auto' : 'none'}>
                <circle cx={C} cy={C} r={R.memory} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
                {memories.map((m) => {
                  const p = polar(R.memory, timeAngle(m.t));
                  const on = related.memoriesOn.has(m.id);
                  const rSize = on ? 11 : 7;
                  return (
                    <g
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => choose({ kind: 'memory', id: m.id })}
                      style={{ opacity: 1 }}
                    >
                      {on && <circle cx={p.x} cy={p.y} r={rSize + 6} fill={MEDIA_TYPE_META[m.type].color} opacity={0.22} />}
                      <circle cx={p.x} cy={p.y} r={rSize} fill={MEDIA_TYPE_META[m.type].color} />
                      <title>{`${m.at} · ${m.legend}`}</title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ---------- 4. Playlist Musicale ---------- */}
            {show('playlist') && (
              <g opacity={emphasis('playlist')} pointerEvents={interactive('playlist') ? 'auto' : 'none'}>
                <circle cx={C} cy={C} r={R.playlist} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={15} />
                {tracks.map((t) => {
                  const a0 = timeAngle(t.start);
                  const a1 = timeAngle(t.end);
                  const on = related.tracksOn.has(t.id);
                  const isNow = nowTrack?.id === t.id;
                  const mid = polar(R.playlist, (a0 + a1) / 2);
                  return (
                    <g
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => choose({ kind: 'track', id: t.id })}
                      style={{ opacity: 1 }}
                    >
                      <path
                        d={arcPath(R.playlist, a0 + 0.25, a1 - 0.25)}
                        fill="none"
                        stroke={isNow ? INK : SETS[t.set].color}
                        strokeWidth={on || isNow ? 18 : 13}
                      />
                      {t.signal && <circle cx={mid.x} cy={mid.y} r={4.5 * fontMult} fill="#fff" stroke={INK} strokeWidth={1.2} />}
                      <title>{`${fmt(t.start)} · ${t.title} — ${t.artist}`}</title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Onde audio : niveau mesuré sur un extrait local, jamais sur l'horloge simulée. */}
            {(
              <circle
                ref={audioPulseRef}
                cx={C}
                cy={C}
                r={R.playlist - 23}
                fill="none"
                stroke={track ? SETS[track.set].color : ACCENTS.blue}
                strokeWidth={0}
                opacity={0}
                pointerEvents="none"
              />
            )}

            {/* Red Needle - Time Indicator */}
            {(show('day') || show('memory') || show('playlist')) && (
              <g pointerEvents="none">
                {(() => {
                  const p1 = polar(R.playlist - 14, nowAngle);
                  const p2 = polar(R.day + 14, nowAngle);
                  return (
                    <>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#FF453A" strokeWidth={3} strokeLinecap="round" />
                      <circle cx={p2.x} cy={p2.y} r={5.5} fill="#FF453A" stroke="#fff" strokeWidth={1.5} />
                    </>
                  );
                })()}
              </g>
            )}

            {/* ---------- 5. Personnes par Table (Avatars Agrandis & Badges XL) ---------- */}
            {show('people') && (
              <g opacity={emphasis('people')} pointerEvents={interactive('people') ? 'auto' : 'none'}>
                {/* Table Arcs with readable names */}
                {GROUP_ARC.map((g) => {
                  const label = polar(R.tables + 2, (g.a0 + g.a1) / 2);
                  const on = person && TABLE_OF[person.id]?.id === g.id;
                  return (
                    <g key={g.id}>
                      <path
                        d={arcPath(R.tables - 6, g.a0, g.a1)}
                        fill="none"
                        stroke={g.color}
                        strokeWidth={5}
                        strokeLinecap="round"
                        opacity={on ? 1 : 0.45}
                      />
                      {Array.from({ length: g.n - 1 }, (_, i) => {
                        const a = g.a0 + (i + 1) * STEP;
                        const p1 = polar(R.tables - 12, a);
                        const p2 = polar(R.tables - 1, a);
                        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--ripple-surface, #ffffff)" strokeWidth={2} />;
                      })}
                      <g>
                        <rect
                          x={label.x - 38 * fontMult}
                          y={label.y - 11 * fontMult}
                          width={76 * fontMult}
                          height={22 * fontMult}
                          rx={11 * fontMult}
                          fill="var(--ripple-surface, #ffffff)"
                          stroke={g.color}
                          strokeWidth={on ? 2 : 1}
                        />
                        <text
                          x={label.x}
                          y={label.y + 0.5}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={12.5 * fontMult}
                          fontWeight="800"
                          fill={INK}
                        >
                          {g.name} · {g.n}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Anneaux d’intérêts permanents */}
                {INTERESTS.map((it, i) => (
                    <circle
                      key={it.id}
                      cx={C}
                      cy={C}
                      r={R.ring0 + i * RING_GAP}
                      fill="none"
                      stroke={it.color}
                      strokeWidth={1.8}
                      opacity={0.3}
                    />
                  ))}

                {/* ---------- Cordes de synergie (liens entre personnes) ---------- */}
                {relationsVisible && person && personLinks.length > 0 && (
                  <g key={`relations-${person.id}-${relationPulse}`} pointerEvents="none">
                    {personLinks.slice(0, 14).map((link, index) => {
                      const otherId = link.a === person.id ? link.b : link.a;
                      const color = GROUP_ARC.find((group) => group.id === TABLE_OF[otherId]?.id)?.color ?? ACCENTS.blue;
                      return (
                        <path
                          key={`chord-${person.id}-${otherId}`}
                          className="ripple-relation-link"
                          d={chordPath(ANGLE[link.a], ANGLE[link.b])}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                          strokeOpacity={0.72}
                          strokeLinecap="round"
                          style={{ animationDelay: `${Math.min(index * 75, 900)}ms` }}
                        >
                          <title>{link.why}</title>
                        </path>
                      );
                    })}
                  </g>
                )}

                {/* Disque central : la sélection respire, les cordes passent dessous */}
                <circle
                  cx={C}
                  cy={C}
                  r={R.centerDisk}
                  fill="var(--ripple-surface, #ffffff)"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth={1.5}
                />

                {/* Pastilles d’intérêts */}
                {ORDER.map((id) =>
                    personData[id].interests.map((it) => {
                      const ri = INTERESTS.findIndex((k) => k.id === it);
                      const p = polar(R.ring0 + ri * RING_GAP, ANGLE[id]);
                      const lit = related.people.has(id);
                      const dotR = (lit ? 5.5 : 3.8) * fontMult;
                      return (
                        <circle
                          key={`${id}-${it}`}
                          cx={p.x}
                          cy={p.y}
                          r={dotR}
                          fill={INTEREST_BY_ID[it].color}
                          stroke="#fff"
                          strokeWidth={1.2}
                          opacity={1}
                        />
                      );
                    })
                  )}

                {/* Repères colorés, portraits accessibles à droite */}
                {ORDER.map((id) => {
                  const p = polar(R.people, ANGLE[id]);
                  const isFocus = person?.id === id;
                  const music = nowTrack?.by === id;
                  const impacted = causalHighlight && impactedPeopleIds.includes(id);
                  const dotColor = GROUP_ARC.find((g) => g.id === TABLE_OF[id]?.id)?.color ?? INK;
                  
                    const dotR = isFocus ? 14 : 9;
                    return (
                      <g
                        key={id}
                        className="cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => choose({ kind: 'person', id })}
                      >
                        {isFocus && <circle cx={p.x} cy={p.y} r={dotR + 7} fill={dotColor} opacity={0.22} />}
                        {impacted && <circle cx={p.x} cy={p.y} r={dotR+6} fill="none" stroke="#FF9F0A"
                          strokeDasharray="3 2" strokeWidth={2} className="ripple-causal-person" />}
                        {!isFocus && relationsVisible && person && related.people.has(id) && (
                          <circle cx={p.x} cy={p.y} r={dotR + 5} fill="none" stroke={dotColor} strokeWidth={2} opacity={0.85} />
                        )}
                        {isFocus && relationsVisible && !reduceMotion && (
                          <circle key={`pulse-${id}-${relationPulse}`} className="ripple-relation-wave" cx={p.x} cy={p.y} r={dotR + 5} fill="none" stroke={dotColor} strokeWidth={3} />
                        )}
                        <circle cx={p.x} cy={p.y} r={dotR} fill={dotColor} />
                        {music && <circle cx={p.x} cy={p.y} r={3.2} fill="#fff" />}
                        <title>{`${fullName(personData[id])} · ${personData[id].job}`}</title>
                      </g>
                    );
                                  })}

                {/* Aiguille de sélection des personnes */}
                <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px` }} pointerEvents="none">
                  <line
                    x1={C}
                    y1={C - R.ring0 + 10}
                    x2={C}
                    y2={C - R.people + 34}
                    stroke={INK}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                  <circle cx={C} cy={C - R.people + 34} r={5} fill={INK} stroke="#fff" strokeWidth={1.5} />
                </g>
              </g>
            )}
          {causalHighlight && show('day') && (
            <g data-testid="public-causal-paths" pointerEvents="none">
              {causalDemoLinks().map((link,i)=>{
                const a=timeAngle(link.sourceMinute);
                const b=timeAngle(link.targetMinute);
                const p1=polar(R.day-16,a);
                const p2=polar(R.day-16,b);
                const mid=polar(R.day-66,(a+b)/2);
                return <path key={link.target}
                  d={`M ${p1.x} ${p1.y} Q ${mid.x} ${mid.y} ${p2.x} ${p2.y}`}
                  fill="none" stroke={i===0?'#FF9F0A':'#FF453A'} strokeWidth={2.2} strokeDasharray="5 5"
                  className="ripple-causal-path" style={{animationDelay:`${i*140}ms`}}/>;
              })}
            </g>
          )}
          {(
            <circle cx={C} cy={C} r={R.hours} fill="none" stroke="transparent" strokeWidth={30}
              className="ripple-time-scrub-hit" data-testid="timeline-scrub-ring"
              style={{touchAction:'none',cursor:'crosshair'}}>
              <title>Glissez pour explorer les instants de 15 h à 5 h</title>
            </circle>
          )}
          <ClockDial minutes={exploreMinute} />
          </svg>

        </div>
          </div>
        <div className="ripple-watch-controls" role="toolbar" aria-label="Commandes du cadran">
          <button type="button" className="ripple-circle-control" aria-pressed={relationsVisible} aria-label={relationsVisible ? 'Masquer les relations' : 'Afficher les relations'} title="Connexions" onClick={() => setRelationsVisible(v => !v)}>
            <Network className="w-4 h-4" />
          </button>
          <span className="ripple-controls-divider" aria-hidden="true" />
          <button type="button" className="ripple-circle-control" aria-label="Dézoomer" disabled={zoom <= ZOOM_MIN} onClick={() => handleZoom(-ZOOM_STEP)}><ZoomOut className="w-4 h-4" /></button>
          <span className="text-[11px] font-bold tabular-nums w-11 text-center" style={{ color: INK }}>{Math.round(zoom * 100)}%</span>
          <button type="button" className="ripple-circle-control" aria-label="Zoomer" disabled={zoom >= ZOOM_MAX} onClick={() => handleZoom(ZOOM_STEP)}><ZoomIn className="w-4 h-4" /></button>
          <button type="button" className="ripple-circle-control" aria-label="Recentrer le cadran" onClick={resetView}><RotateCcw className="w-4 h-4" /></button>
          <span className="ripple-controls-divider" aria-hidden="true" />
          <button type="button" className="ripple-circle-control" onClick={() => setAudioMuted(m => !m)} aria-label={audioMuted ? 'Activer les effets sonores' : 'Couper les effets sonores'} title="Effets sonores">
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
        </div>

        {/* Une seule colonne : le contexte visible et les outils avancés repliés. */}
        <aside className="ripple-inspector" aria-label="Comprendre et agir">
          <InstantInspector
            minute={exploreMinute} selectedKind={focus.kind} selectedTitle={focusTitle}
            moment={activeMoment} people={activePeople}
            playingTitle={nowTrack?.title ?? null} following={followDemo}
            onMinute={chooseInstant}
            onFollow={() => {
              if (followDemo) setFollowDemo(false);
              else {
                setFollowDemo(true);
                setExploreMinute(minutes);
                setFocus({kind:'moment',id:momentAt(minutes).id});
              }
            }}
            onMoment={id=>choose({kind:'moment',id})}
          >
            <PublicIncidentDemo mode={publicMode} delay={publicDelay} selectedPlan={publicPlan}
              onDelay={setPublicDelay} onMode={setPublicMode} onSelectPlan={setPublicPlan}/>
            <PublicAftermathDemo mode={publicMode} delay={publicDelay} selectedPlan={publicPlan}
              onMode={setPublicMode} onMinute={chooseInstant}/>
            {track && <AudioPreview key={track.id} track={track} onLevel={onAudioLevel}/>}
            <details className="ripple-context-fold">
              <summary>Fiche complète de la sélection</summary>
              <SelectionDetail focus={focus} account={account} person={person} moment={moment}
                track={track} media={media} dayFocus={dayFocus} journeySel={journeySel}
                personLinks={personLinks} turning={turning}
                onToggleTurn={()=>{
                  sfx.playNodeClick();
                  if(!turning) setFocus({kind:'person',id:nearestPerson(angle)});
                  setTurning(v=>!v);
                }}
                choose={choose} onScrub={onScrub} momentStates={engine.moments}/>
            </details>
            <details className="ripple-context-fold">
              <summary>Régie simulée · commandes</summary>
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[17px] tabular-nums">{fmt(minutes)}</span>
                  <button type="button" onClick={()=>manual?onResume():onToggle()} className="ripple-action-small">
                    {live?<Pause className="w-3.5 h-3.5"/>:<Play className="w-3.5 h-3.5"/>}
                    {manual?'Reprendre':paused?'Play':'Pause'}
                  </button>
                </div>
                <input aria-label="Temps de régie fictif de 21:00 à 21:56" type="range"
                  min={ORCH_START} max={ORCH_END} step={1} value={scrubValue}
                  onChange={e=>onScrub(Number(e.target.value))} className="ios-slider w-full"/>
                <p className="text-[12px] opacity-75">La régie est indépendante de la chronologie libre sur 14 h.</p>
                {scene&&<p className="text-[12px] opacity-75">{scene.headline} · marge +{slack} min · stabilité {stability} %</p>}
                {nextSignal?.signal&&<p className="text-[12px]">Prochain signal : {nextSignal.signal.label}</p>}
              </div>
            </details>
            <details className="ripple-context-fold">
              <summary>Décisions de la régie · simulation</summary>
              <div className="p-2"><ActionPanel engine={engine}/></div>
            </details>
            <details className="ripple-context-fold">
              <summary>Explorer les éléments de cette couche</summary>
              <div className="p-2">
                <LayerList activeLayer={activeLayer} focus={focus} account={account}
                  journey={publicJourney} tracks={tracks} memories={memories}
                  nowTrackId={nowTrack?.id??null} minutes={exploreMinute} choose={choose}/>
              </div>
            </details>
          </InstantInspector>
        </aside>
      </div>

      <p className="ripple-demo-footnote">Démonstration fictive · {NET_GUESTS.length + TEAM_GROUP.guests.length} profils enregistrés localement · aucune synchronisation réelle</p>
    </main>
  );
};

/* ===================== Panneau · Détail de la sélection ===================== */

interface DetailProps {
  focus: Focus;
  account: AccountState;
  person: NetGuest | null;
  moment: (typeof DAY_MOMENTS)[number] | null;
  track: ReturnType<typeof schedule>[number] | null;
  media: ((typeof MEMORIES)[number] & { t: number }) | null;
  dayFocus: number | null;
  journeySel: JourneyMilestone | null;
  personLinks: { a: string; b: string; why: string }[];
  turning: boolean;
  onToggleTurn: () => void;
  choose: (f: Focus) => void;
  onScrub: (m: number) => void;
  momentStates: Record<string, { status: string; delayMinutes: number }>;
}

const SelectionDetail: React.FC<DetailProps> = ({
  focus,
  account,
  person,
  moment,
  track,
  media,
  dayFocus,
  journeySel,
  personLinks,
  turning,
  onToggleTurn,
  choose,
  onScrub,
  momentStates
}) => {
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const personDocs = person?.roleId ? DOCS[person.roleId] ?? [] : [];
  const personRole = person?.roleId ? ROLES.find((r) => r.id === person.roleId) ?? null : null;
  const openDoc = personDocs.find((d) => d.id === openDocId) ?? null;

  return (
    <section aria-label="Sélection" className="bg-[#fcfcfd] border border-black/[0.08] rounded-[22px] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] pb-3">
        <Eyebrow>{focus.kind === 'person' ? 'L’aiguille est sur' : 'Sélection'}</Eyebrow>
        {person && <button
          type="button"
          onClick={onToggleTurn}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-bold bg-black/[0.06] hover:bg-black/[0.1] text-black"
        >
          {turning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {turning ? 'Pause' : 'Tourner'}
        </button>}
      </div>

      <div key={JSON.stringify(focus)} className="news-swap mt-4 space-y-4 min-h-[160px]">
        {person && (
          <>
            <div>
              <p className="text-[22px] font-extrabold tracking-tight" style={{ color: INK }}>
                {person.first} {person.last}
              </p>
              <p className="text-[14.5px] font-medium text-[#424245] mt-0.5">
                {person.job} · <span className="text-[#0066cc] font-semibold">{TABLE_OF[person.id]?.name}</span>
              </p>
              <p className="text-[14px] mt-1.5 font-medium leading-snug">
                Recherche active : <span className="font-bold text-black">{person.seeking}</span>
              </p>
              {person.id === account.profileId && (
                <p className="text-[12.5px] mt-1 font-medium" style={{ color: MUTED }}>
                  RSVP : {account.rsvp === 'yes' ? `Oui · ${account.partySize} ${account.partySize > 1 ? 'personnes' : 'personne'}` : account.rsvp === 'no' ? 'Non' : 'À confirmer'}
                  {account.rsvp !== 'no' && account.meal ? ` · ${account.meal === 'poisson' ? 'Filet de bar' : account.meal === 'volaille' ? 'Suprême de volaille' : 'Végétarien'}` : ''}
                </p>
              )}
            </div>

            {personLinks.length > 0 && (
              <div className="border-t border-black/[0.08] pt-3">
                <Eyebrow>Opportunités d'affaires directes ({personLinks.length})</Eyebrow>
                <ul className="divide-y divide-black/[0.06] mt-1.5">
                  {personLinks.slice(0, 4).map((l) => {
                    const other = personRecord(account, l.a === person.id ? l.b : l.a);
                    const common = sharedInterests(person, other);
                    return (
                      <li key={other.id}>
                        <button
                          type="button"
                          onClick={() => choose({ kind: 'person', id: other.id })}
                          className="w-full flex items-center gap-3 py-2 text-left group"
                        >
                          <img
                            src={photoOf(account, other.id)}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-bold truncate group-hover:text-[#0066cc]" style={{ color: INK }}>
                              {l.why} · {other.first} {other.last}
                            </span>
                            <span className="block text-[12.5px] font-medium truncate" style={{ color: MUTED }}>
                              {other.job} · {TABLE_OF[other.id]?.name}
                              {common.length ? ` · ${common.map((c) => INTEREST_BY_ID[c].label).join(', ')}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {personDocs.length > 0 && personRole && (
              <div className="border-t border-black/[0.08] pt-3">
                <Eyebrow>Documents & Contrats ({personDocs.length})</Eyebrow>
                <ul className="mt-2 divide-y divide-black/[0.06]">
                  {personDocs.map((d) => {
                    const total = d.lines ? totalsOf(d).ttc : null;
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => {
                            sfx.playNodeClick();
                            setOpenDocId(d.id);
                          }}
                          className="w-full py-2 text-left flex items-center justify-between gap-2 group"
                        >
                          <span className="min-w-0">
                            <span className="block text-[14px] font-bold truncate group-hover:text-[#0066cc]" style={{ color: INK }}>
                              {d.title}
                            </span>
                            <span className="block text-[12px] font-medium" style={{ color: MUTED }}>
                              {d.number} · <span className="font-semibold text-black">{d.status}</span>
                              {total !== null ? ` · ${euro(total)}` : ''}
                            </span>
                          </span>
                          <span className="text-[12px] font-bold text-[#0066cc] shrink-0">Ouvrir ›</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {moment && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[20px] font-extrabold tracking-tight" style={{ color: INK }}>
                {moment.at} · {moment.title}
              </p>
              {momentStates[moment.id] && (() => {
                const s = momentStates[moment.id];
                const meta = (LIFECYCLE_META as Record<string, { label: string; dot: string; text: string }>)[s.status];
                if (!meta) return null;
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                    style={{ background: `${meta.dot}22`, color: meta.text, border: `1px solid ${meta.dot}55` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                    {s.delayMinutes ? ` · +${s.delayMinutes} min` : ''}
                  </span>
                );
              })()}
            </div>
            <p className="text-[14px] font-medium text-[#424245]">{moment.lieu}</p>
            <ul className="space-y-1.5 mt-2">
              {moment.tasks.map((t) => (
                <li key={t} className="text-[13.5px] font-medium leading-relaxed flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A39]" />
                  {t}
                </li>
              ))}
            </ul>

          </>
        )}

        {track && (
          <>
            <p className="text-[20px] font-extrabold tracking-tight" style={{ color: INK }}>
              {track.title}
            </p>
            <p className="text-[14.5px] font-medium" style={{ color: BODY }}>
              {track.artist} · <span className="font-bold">{fmt(track.start)} – {fmt(track.end)}</span>
            </p>
            {track.signal && (
              <p className="text-[13.5px] font-semibold text-[#9A5B00] flex items-center gap-1.5 bg-[#FF9F0A]/10 p-2.5 rounded-xl">
                <BellRing className="w-4 h-4 shrink-0" />
                Signal régie : {track.signal.label} ({track.signal.cue})
              </p>
            )}
            <button
              type="button"
              onClick={() => choose({ kind: 'person', id: track.by })}
              className="text-[13.5px] font-bold text-[#0066cc] hover:underline block mt-1"
            >
              Voir {NET_BY_ID[track.by]?.first} dans le cercle ›
            </button>
            {track.start >= ORCH_START && track.start <= ORCH_END && (
              <button
                type="button"
                onClick={() => {
                  sfx.playBlip(900, 0.02);
                  onScrub(track.start);
                }}
                className="block text-[13.5px] font-bold text-[#1E7A39] hover:underline"
              >
                Placer le direct sur ce morceau ›
              </button>
            )}
          </>
        )}

        {media && (
          <>
            <p className="text-[17px] font-extrabold leading-snug" style={{ color: INK }}>
              {media.legend}
            </p>
            <p className="text-[14px] font-medium" style={{ color: BODY }}>
              {media.at} · <span className="font-semibold">{MEDIA_TYPE_META[media.type].label}</span> de {fullName(NET_BY_ID[media.author])}
            </p>
            {NET_BY_ID[media.author] && (
              <button
                type="button"
                onClick={() => choose({ kind: 'person', id: media.author })}
                className="text-[13.5px] font-bold text-[#0066cc] hover:underline block mt-1"
              >
                Voir l’auteur dans le cercle ›
              </button>
            )}
          </>
        )}

        {dayFocus !== null && (
          <p className="text-[14px] font-medium leading-relaxed" style={{ color: BODY }}>
            {dayFocus === DAY_J_DOY
              ? 'Le jour J : tous les moments clés s’illuminent dans l’anneau du conducteur. Les flèches ← → parcourent les repères de préparation.'
              : 'Jour de préparation de l’année. Les points orange marquent les grands jalons jusqu’au jour J.'}
          </p>
        )}
        {journeySel && (
          <>
            <p className="text-[13px] font-bold tabular" style={{ color: MUTED }}>
              {new Date(`${journeySel.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[20px] font-extrabold tracking-tight" style={{ color: INK }}>
              {journeySel.title}
            </p>
            {journeySel.detail && (
              <p className="text-[14px] leading-snug" style={{ color: BODY }}>
                {journeySel.detail}
              </p>
            )}
          </>
        )}
      </div>

      {openDoc && personRole && <DocSheet doc={openDoc} role={personRole} onClose={() => setOpenDocId(null)} />}
    </section>
  );
};

/* ===================== Panneau · Liste de la couche active (Grande Lisibilité) ===================== */

interface LayerListProps {
  activeLayer: RippleLayer;
  focus: Focus;
  account: AccountState;
  journey: JourneyMilestone[];
  tracks: ReturnType<typeof schedule>;
  memories: ((typeof MEMORIES)[number] & { t: number })[];
  nowTrackId: string | null;
  minutes: number;
  choose: (f: Focus) => void;
}

const LayerList: React.FC<LayerListProps> = ({ activeLayer, focus, account, journey, tracks, memories, nowTrackId, minutes, choose }) => {
  const header = (label: string, count: number) => (
    <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] pb-2.5">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-black">
        {label}
      </p>
      <span className="text-[12.5px] font-bold tabular px-2 py-0.5 rounded-full bg-black/5" style={{ color: INK }}>
        {count}
      </span>
    </div>
  );

  const row = (key: string, active: boolean, onClick: () => void, children: React.ReactNode) => (
    <li key={key}>
      <button
        type="button"
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
        className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl text-left transition-colors"
        style={{
          background: active ? 'rgba(0, 102, 204, 0.12)' : 'transparent',
          boxShadow: active ? 'inset 0 0 0 1px #0066cc' : 'none'
        }}
      >
        {children}
      </button>
    </li>
  );

  return (
    <section aria-label="Contenu de la couche active" className="bg-[#fcfcfd] border border-black/[0.08] rounded-[22px] p-5 shadow-sm">
      {activeLayer === 'calendar' && (
        <>
          {header('Repères de préparation Annuelle', CAL_MARKERS.length)}
          <ul className="mt-2 divide-y divide-black/[0.05]">
            {CAL_MARKERS.map((mk) => {
              const doy = DAY_J_DOY + mk.offset;
              return row(mk.label, focus.kind === 'day' && focus.doy === doy, () => choose({ kind: 'day', doy }), (
                <>
                  <span className="w-[50px] shrink-0 text-[13px] font-extrabold tabular" style={{ color: INK }}>
                    {mk.label}
                  </span>
                  <span className="min-w-0 text-[13.5px] font-medium truncate" style={{ color: BODY }}>
                    {mk.detail}
                  </span>
                </>
              ));
            })}
          </ul>
        </>
      )}

      {activeLayer === 'journey' && (
        <>
          {header('Parcours de vie', journey.length)}
          <ul className="mt-2 divide-y divide-black/[0.05] max-h-[340px] overflow-y-auto no-scrollbar">
            {journey.map((m) =>
              row(m.id, focus.kind === 'journey' && focus.id === m.id, () => choose({ kind: 'journey', id: m.id }), (
                <>
                  <span className="w-[86px] shrink-0 text-[12px] font-extrabold tabular" style={{ color: INK }}>
                    {new Date(`${m.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: JOURNEY_COLORS[m.kind] ?? '#8e8e93' }}
                  />
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium truncate" style={{ color: BODY }}>
                    {m.title}
                  </span>
                </>
              ))
            )}
          </ul>
          {journey.length === 0 && (
            <p className="mt-3 text-[13px]" style={{ color: MUTED }}>
              Aucune étape partagée pour l’instant — ajoutez-les depuis l’onglet Parcours du Compte.
            </p>
          )}
        </>
      )}

      {activeLayer === 'day' && (
        <>
          {header('Conducteur Jour J · 15:00 → 05:00', DAY_MOMENTS.length)}
          <ul className="mt-2 divide-y divide-black/[0.05] max-h-[340px] overflow-y-auto no-scrollbar">
            {DAY_MOMENTS.map((m) =>
              row(m.id, focus.kind === 'moment' && focus.id === m.id, () => choose({ kind: 'moment', id: m.id }), (
                <>
                  <span className="w-[46px] shrink-0 text-[13px] font-extrabold tabular" style={{ color: timeToMinutesFrom17(m.at) <= minutes ? INK : MUTED }}>
                    {m.at}
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium truncate" style={{ color: BODY }}>
                    {m.title}
                  </span>
                  {m.retard ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#C7342B] shrink-0">
                      +{m.retard} min
                    </span>
                  ) : m.cle ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/5 shrink-0" style={{ color: MUTED }}>
                      Clé
                    </span>
                  ) : null}
                </>
              ))
            )}
          </ul>
        </>
      )}

      {activeLayer === 'memory' && (
        <>
          {header('Le Film Chronologique du Jour J', memories.length)}
          <ul className="mt-2 divide-y divide-black/[0.05] max-h-[340px] overflow-y-auto no-scrollbar">
            {memories.map((m) =>
              row(m.id, focus.kind === 'memory' && focus.id === m.id, () => choose({ kind: 'memory', id: m.id }), (
                <>
                  <span className="w-[46px] shrink-0 text-[13px] font-extrabold tabular" style={{ color: INK }}>
                    {m.at}
                  </span>
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: MEDIA_TYPE_META[m.type].color }} />
                  <span className="min-w-0 text-[13.5px] font-medium truncate" style={{ color: BODY }}>
                    {m.legend}
                  </span>
                </>
              ))
            )}
          </ul>
        </>
      )}

      {activeLayer === 'playlist' && (
        <>
          {header('Playlist & Signaux Sonores', tracks.length)}
          <ul className="mt-2 divide-y divide-black/[0.05] max-h-[340px] overflow-y-auto no-scrollbar">
            {tracks.map((t) =>
              row(t.id, focus.kind === 'track' && focus.id === t.id, () => choose({ kind: 'track', id: t.id }), (
                <>
                  <span className="w-[46px] shrink-0 text-[13px] font-extrabold tabular" style={{ color: nowTrackId === t.id ? INK : MUTED }}>
                    {fmt(t.start)}
                  </span>
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: SETS[t.set].color }} />
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium truncate" style={{ color: BODY }}>
                    {t.title} <span style={{ color: MUTED }}>— {t.artist}</span>
                  </span>
                  {t.signal && <BellRing className="w-4 h-4 shrink-0 text-[#E6A100]" />}
                  {nowTrackId === t.id && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black text-white shrink-0">
                      ♪ en cours
                    </span>
                  )}
                </>
              ))
            )}
          </ul>
        </>
      )}

      {(activeLayer === 'people' || activeLayer === 'overview') && (
        <>
          {header('Convives & Équipe de Réception', ORDER.length)}
          <ul className="mt-2 max-h-[340px] overflow-y-auto no-scrollbar space-y-1">
            {GROUP_ARC.map((g) => (
              <React.Fragment key={g.id}>
                <li className="sticky top-0 bg-[#fcfcfd] py-1.5 flex items-center gap-2 border-b border-black/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.08em]" style={{ color: INK }}>
                    {g.name} · {g.n} personnes
                  </span>
                </li>
                {GROUPS.find((x) => x.id === g.id)?.guests.map((id) => {
                  const p = personRecord(account, id);
                  return row(id, focus.kind === 'person' && focus.id === id, () => choose({ kind: 'person', id }), (
                    <>
                      <img src={photoOf(account, id)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-black/10" loading="lazy" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-bold truncate" style={{ color: INK }}>
                          {p.first} {p.last}
                        </span>
                        <span className="block text-[12px] font-medium truncate" style={{ color: MUTED }}>
                          {p.job}
                        </span>
                      </span>
                    </>
                  ));
                })}
              </React.Fragment>
            ))}
          </ul>
        </>
      )}

      <p className="mt-4 text-[12px] font-medium leading-snug" style={{ color: MUTED }}>
        ← → au clavier pour naviguer · + / - pour zoomer · 0 pour recentrer.
      </p>
    </section>
  );
};
