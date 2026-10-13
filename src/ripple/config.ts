/*
 * Ripple geometry & visual configuration.
 *
 * Extracted from Ripple.tsx for Phase 1 stabilization so that future
 * Gathering templates can override ring radii, colors and labels
 * without editing the visualization components.
 */

export const RIPPLE_SIZE = 1000;
export const RIPPLE_CENTER = RIPPLE_SIZE / 2;

/**
 * Ring radii (outer/inner or centerline).
 *
 * Conceptual mapping (preserved from the original implementation):
 *   Ring 7 — Calendar / prep timeline (outermost)
 *   Ring 6 — Journey / life milestones
 *   Ring 5 — Day-of timeline / moments
 *   Ring 4 — Hours / time scale
 *   Ring 3 — Memory / media
 *   Ring 2 — Playlist / music
 *   Ring 1 — Groups / tables
 *   Ring 0 — People / avatars
 *   Center — Selection card
 */
export const RINGS = {
  calOuter: 488,
  calInner: 462,
  lifeOuter: 456,
  lifeInner: 438,
  day: 432,
  hours: 408,
  memory: 384,
  playlist: 354,
  tables: 320,
  people: 288,
  ring0: 172, // inner interest rings start here
  chord: 162,
  centerDisk: 148
} as const;

export const RING_GAP = 12;

/** Zoom bounds */
export const ZOOM_MIN = 0.85;
export const ZOOM_MAX = 2.4;
export const ZOOM_STEP = 0.25;
export const PAN_MAX = 280;

/**
 * Palette — kept semantic so day/night themes can swap them via CSS variables.
 * Direct color references are acceptable for accent dots that carry meaning
 * across themes (calendar months, interest rings, signal colors).
 */
export const ACCENTS = {
  ink: 'var(--ripple-ink, #1d1d1f)',
  muted: 'var(--ripple-muted, #515154)',
  body: 'var(--ripple-body, #1d1d1f)',
  surface: 'var(--ripple-surface, #ffffff)',
  line: 'var(--ripple-line, rgba(0,0,0,0.1))',
  blue: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  purple: '#BF5AF2',
  indigo: '#5E5CE6',
  pink: '#FF375F',
  teal: '#64D2FF'
} as const;

/** Theme-independent accent colors used for group/interest dots. */
export const GROUP_COLORS = ['#0A84FF', '#D96B00', '#D91E48', '#1E7A39', '#1d1d1f'];

/** Day-of-month time anchor (wedding demo: 15:00 → 05:00 the next day). */
export const DAY_START_MINUTES_FROM_17 = -120; // 15:00 in "minutes from 17" system
export const DAY_END_MINUTES_FROM_17 = 720;    // 05:00 next day
export const DAY_SPAN_MINUTES = DAY_END_MINUTES_FROM_17 - DAY_START_MINUTES_FROM_17;

/** Months and season colors used on the calendar ring. */
export const CALENDAR_YEAR = 2026;
export const CALENDAR_MONTHS = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
];
export const SEASON_COLORS = [
  '#0A84FF', '#0A84FF', // Jan-Feb: winter blue
  '#1E7A39', '#1E7A39', '#1E7A39', // Mar-May: spring green
  '#E6A100', '#E6A100', '#E6A100', // Jun-Aug: summer gold
  '#D96B00', '#D96B00', '#D96B00', // Sep-Nov: autumn orange
  '#0A84FF' // Dec: winter blue
];

/**
 * Interface a future Gathering template must provide to render on the Ripple.
 * The wedding demo uses the default values.
 */
export interface RippleTemplateConfig {
  /** Label for the central "time" readout. */
  timeLabel: string;
  /** Which rings are visible by default (all rings can be toggled). */
  defaultVisibleRings: RingId[];
  /** Accent color used for the template's primary emphasis. */
  accent: string;
}

export type RingId =
  | 'calendar'
  | 'journey'
  | 'day'
  | 'hours'
  | 'memory'
  | 'playlist'
  | 'tables'
  | 'people'
  | 'center';

export const WEDDING_RIPPLE_CONFIG: RippleTemplateConfig = {
  timeLabel: 'Temps de la régie',
  defaultVisibleRings: ['calendar', 'journey', 'day', 'hours', 'memory', 'playlist', 'tables', 'people', 'center'],
  accent: '#FF375F'
};
