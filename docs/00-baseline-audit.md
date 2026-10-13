# RIPPLECIRCLE — Phase 0 · Baseline Audit

**Audit date:** 2026-10-13
**Baseline commit:** `5ae14ae` (Initialisation RIPPLECIRCLE)
**Working branch:** `feat/ripplecircle-evolution`
**Build status:** ✅ `npm run build` succeeds (1943 modules, 413 kB single-file bundle)

---

## 1. Architecture Inventory

### Stack
| Layer | Technology | Version |
|---|---|---|
| Runtime | React + TypeScript | React 19.2.6 / TS 5.9.3 |
| Bundler | Vite (single-file output) | 7.3.2 |
| Styling | Tailwind CSS 4 | 4.1.17 |
| Icons | lucide-react | 1.55.0 |
| PDF | jspdf (but custom generator used) | 4.2.1 (unused) |
| Confetti | canvas-confetti | 1.9.4 (unused) |
| Audio | Web Audio API (synthesized SFX) | native |
| Persistence | `localStorage` via `usePersistentState` | browser-only |

### Source tree
```
src/
├── App.tsx                   # thin shell → <Landing />
├── main.tsx                  # React root
├── index.css                 # Tailwind + theme-day/night vars + iOS motion system
├── components/landing/
│   ├── Landing.tsx           # hash router, header, theme toggle, toast
│   ├── Ripple.tsx            # ** THE circular UI — 1933 lines **
│   ├── AccountPage.tsx       # profile/RSVP/journey/display tabs
│   └── DocSheet.tsx          # modal doc preview + PDF download
├── hooks/
│   ├── useOrchestra.ts       # simulated clock (21:00→21:56) + cascading scenes
│   └── usePersistentState.ts # localStorage useState wrapper
├── schema/
│   ├── core.ts               # ** NEW ** generic Gathering/Person/Moment/Track/...
│   └── mariage.ts            # wedding adapter: builds WEDDING_GATHERING from data/*
├── data/                     # ** LEGACY ** static wedding demo fixtures
│   ├── networking.ts         # 32 guests + 6 team, synergy rules, greedy seating
│   ├── dayOf.ts              # 18 timeline moments 15:00→05:00
│   ├── playlist.ts           # ~50 tracks across 5 sets with cues
│   ├── memory.ts             # 26 media memories (picsum.photos URLs)
│   ├── documents.ts          # full quotes/contracts/invoices per role
│   ├── roles.ts              # 7 role profiles with timelines & alerts
│   ├── weddingData.ts        # 10 stakeholder avatars + 4 scenarios + cue list
│   ├── guestStories.ts       # 38 mini-bios + avatar URL resolver
│   └── account.ts            # AccountState + INITIAL_ACCOUNT (Antoine Moreau)
├── types/index.ts            # Stakeholder/TimelinePhase/WeddingScenario types
└── utils/
    ├── radial.ts             # polarXY, arcPathAt, normDeg, angularDist
    ├── time.ts               # timeToMinutesFrom17 (17:00-anchored overnight)
    ├── audio.ts              # WebAudio SFX: blip, click, alert, success
    ├── pdf.ts                # hand-rolled A4 PDF generator (no jspdf)
    └── cn.ts                 # clsx + tailwind-merge
```

### Critical observation: Two parallel data layers
- **`data/*` + `types/`** is what actually renders. The Ripple component imports directly from `data/networking`, `data/dayOf`, `data/playlist`, `data/memory`, `data/documents`, `data/roles`, `data/account`, `data/orchestra`, `data/guestStories`.
- **`schema/core.ts` + `schema/mariage.ts`** was authored as a forward-looking generic schema but is **not consumed by any component**. The wedding template builds a `WEDDING_GATHERING` from the same legacy data, but no UI reads from it.
- The two layers have **duplicated type definitions** that diverge (e.g. `Interest` in `networking.ts` vs `InterestId` in `core.ts`; `MomentStatus` in `core.ts` vs inline literals; `TrackSet` / `Track` differ between `core.ts` and `playlist.ts`).

---

## 2. Feature Audit Matrix

| # | Feature | Source | Behavior | Data source | Persistence | Permissions | Status | UX issues | Risks |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Concentric circular visualization | `Ripple.tsx` | SVG-based 7-ring dial (cal→life→day→memory→playlist→tables→people) at 1000×1000 viewBox | `data/*` static | none | none | **WORKING** | Fixed 1000px center; rings hardcoded to wedding; no real rotation of whole circle, only needle rotates | Geometry breaks if data size changes; zoom >1.05 panning uses naive pixel math |
| F2 | Layer navigation (overview/calendar/journey/day/memory/playlist/people) | `Landing.tsx` hash routing | Header pill-nav swaps `activeLayer`; each layer re-focuses selection | URL hash + prop | URL only | none | **WORKING** | On mobile only one layer shows at a time; on desktop all layers always render (`show()` returns true) | None critical |
| F3 | Needle rotation & person selection | `Ripple.tsx` | Auto-rotating needle sweeps people ring; pointer-drag snaps to nearest person; ←/→ keys; pause/play button | `ANGLE[]` precomputed from table guests | none | none | **WORKING** | Auto-rotation speed hardcoded to 1 rev / 90s; no touch velocity; needle drag only on people ring | No real "rotate the whole circle"; rotates only the meeting needle |
| F4 | Zoom & pan | `Ripple.tsx` | +/– buttons (0.85–2.4×), pan with pointer when zoomed, reset button; +/-/0 keys | React state | none | none | **PARTIAL** | Pan only when touching outside ring; wheel/pinch not supported; pan bounds ±280 | No touch-pinch zoom; pan math is approximate |
| F5 | Face A (graphic dots) / Face B (avatar photos) flip | `Ripple.tsx` | CSS 3D flip on button or "F" key; face B shows round photos + RSVP badge | Ripple state + account | none | none | **WORKING** | On flip, focus jumps to `account.profileId`; Face B has no interest dots (by design) | `clipPath` ids `rp-p-${id}` are duplicated if component remounts (invalid HTML) |
| F6 | Cross-layer highlighting | `Ripple.tsx` `related` memo | Selecting a person/moment/track/memory lights up associated entities across rings | Derived from static data | none | none | **PARTIAL** | Relationship chords (`LINKS`) are computed but **never rendered** in SVG — only dots light up | LINKS array exists but links are visually invisible; no chord curves drawn |
| F7 | Simulated live clock (orchestration) | `useOrchestra.ts` | Advances 1 min / 900ms between 21:00 and 21:56, then loops; scrubs via slider | `data/orchestra.ts` SCENES | none | none | **WORKING (DEMO)** | Only covers 56 min window; scenes are pre-scripted; "manual" scrub pauses auto-advance | Not a real engine — cascade is pre-baked timeline, not reactive; no dependencies graph |
| F8 | Caterer-delay scenario (+12 min) | `data/orchestra.ts` s1–s10 | Hardcoded cascade: traiteur→planner→dj→photographe→maries→invité over 56 min | Static scenes | none | none | **DEMO** | Scenario is linear and not interactive; user cannot create new delays or accept/reject plan B | No user decision point; consequences are deterministic narrative |
| F9 | Person/profile editing | `AccountPage.tsx` profile tab | Edit first/last/job/company/sector/email/phone/bio/seeking, toggle interests, upload avatar (base64) | `usePersistentState('regie.account.v2')` | **localStorage** key `regie.account.v2` | none (device-local) | **WORKING** | Editing replaces only profile `n1` (Antoine Moreau); no other profiles editable; avatar upload inlined as data URL (localStorage quota) | localStorage size limit (~5MB); one user per browser; data URL avatars bloat storage |
| F10 | RSVP & meal choices | `AccountPage.tsx` RSVP tab | yes/no/maybe, party size, meal (fish/poultry/veg), allergy, shuttle, access needs | Same AccountState | localStorage | none | **WORKING (DEMO)** | RSVP is stored locally only; does not propagate to any backend; shown as badge on Face B | Explicit note in UI: "synchronisation nécessite la version connectée" |
| F11 | Life journey (shared milestones) | AccountPage + Ripple life ring | Add/delete milestones with date/kind/title/detail; toggle shared flag; milestones appear on life ring at angle proportional to lifespan | AccountState.journey | localStorage | none | **WORKING** | Journey spans birth→wedding date; unshared milestones hidden; click on milestone centers selection | Lifespan computed from first `naissance` milestone or first entry — brittle if no birth |
| F12 | Day/night theme | AccountPage display tab + header SunMoon toggle | Toggles `.theme-day` / `.theme-night` class; CSS variables re-color ink/muted/surface | AccountState.theme | localStorage | none | **WORKING** | Night theme uses `!important` overrides for hardcoded color classes; fragile | Heavy use of `!important` on Tailwind arbitrary color classes |
| F13 | People / table seating view | `Ripple.tsx` people ring | 4 guest tables + 1 team group; group arcs with names/colors; dots colored by table; avatars on Face B | `data/networking.ts` buildTables() | none | none | **WORKING** | Seating is computed once at module load with greedy algorithm; users cannot re-seat; couples deliberately separated (score -100) | Static — adding a person requires editing source |
| F14 | Synergy / networking links | `data/networking.ts` `SYNERGIES` + `LINKS` | Computes sector-complementarity pairs; displays in right panel "Opportunités d'affaires directes" (up to 4) | Static SYNERGIES table | none | none | **PARTIAL** | List shows matches in inspector, but chord lines between people in the circle are **not drawn**; shared-interest score not surfaced visually | LINKS array computed but unused in SVG; synergy rules are hardcoded pairs, not extensible |
| F15 | Annual calendar ring | `Ripple.tsx` CAL_MARKERS | Outer ring shows 12 months by season; day ticks; 7 preparation markers (J-90 … J-0); click a day to focus | Static constants | none | none | **WORKING (DEMO)** | Year hardcoded to 2026; fixed to Oct 11 wedding; day ticks render 365 SVG lines (perf cost) | Year is constant; not reusable for other gatherings; ticks are fine for demo but slow on low-end |
| F16 | Playlist scheduling & cues | `data/playlist.ts` + Ripple | Track arcs on playlist ring; signals marked with white dot; now-track highlighted; next-signal in header; scrub to track | Static BASE_TRACKS + localStorage added tracks | `regie.playlist.added.v1` | none | **PARTIAL** | Adding tracks exists in localStorage key but **no UI to add**; no audio playback; "proposed by" field shown but not interactive; cues are visual only | `added` state read but no UI writes to it; no real music integration (by design — demo) |
| F17 | Memory / media timeline | `data/memory.ts` + Ripple memory ring | 26 colored dots at time-angles; clicking selects; listed chronologically in side panel | Static MEMORIES array (picsum.photos) | none | none | **DEMO** | All URLs are picsum.photos placeholders; no upload UI; no real media; author is string id not fully linked | External images load over network; no offline support; no upload |
| F18 | Day-of timeline (conducteur) | `data/dayOf.ts` + Ripple day ring | 18 moment arcs; red ! marker for delays; delay cause/planB/impacts shown in inspector | Static DAY_MOMENTS | none | none | **WORKING (DEMO)** | Moment d7 "Retard traiteur" has hardcoded +12 delay; not reactive to live state; causal narrative is static text | Status does not change based on orchestration state; d7.delayMinutes and d8 are fixed |
| F19 | Document viewer | `DocSheet.tsx` | Modal sheet with rendered paper, checklist persistence, "sign" button (local only), PDF download | `data/documents.ts` DOCS | `regie.checks.v1`, `regie.signed.v2` (localStorage) | none | **WORKING (DEMO)** | Checklist state persists per-device; signature is a local boolean — no real e-sign; PDF is hand-generated and downloads | "Signer ce document" button only flips a local flag — explicitly NOT legal signature (good) |
| F20 | PDF generation | `utils/pdf.ts` | Hand-rolled PDF writer (A4, Helvetica WinAnsi); generates quotes/contracts/invoices with totals, clauses, signature blocks | DocItem object | none (download) | none | **WORKING** | Totals, VAT, paid% calculated correctly; checklist and signature boxes render; French accents mapped to WinAnsi | jspdf is in package.json but unused; single-Page doc breaks if content overflows (manual `need()` calls) |
| F21 | Sound effects | `utils/audio.ts` sfx | WebAudio-synthesized blips/clicks/alerts/success on interactions; can fail silently | Native WebAudio | none | none | **WORKING** | Respects `prefers-reduced-motion` (implicitly via animations off); no master mute toggle | AudioContext created on first interaction (browser autoplay policy) — good; no volume control |
| F22 | Keyboard navigation | `Ripple.tsx` onKeyDown | ←/→ step through items; F flip face; +/- zoom; 0 reset | DOM events | n/a | n/a | **WORKING** | Focus management is manual; `tabIndex=0` on circle but no roving tabindex; Esc doesn't close doc sheet | No focus trap in DocSheet modal; no arrow-key navigation of doc checklist |
| F23 | Reduced-motion support | CSS + Ripple useEffect | `prefers-reduced-motion: reduce` disables CSS animations and auto-rotation at load time | matchMedia | n/a | n/a | **WORKING** | Initial state respects it, but toggling the media query after load does not update turning state | Listener only runs at mount for `compact`, not for reducedMotion |
| F24 | Mobile responsive | CSS + `compact` useEffect | Below 640px only one layer shows; bottom-sheet doc modal; no side-by-side inspector on mobile | matchMedia `(max-width: 639px)` | n/a | n/a | **PARTIAL** | Circle is aspect-square and shrinks to fit; touch events handled via pointer events; no pinch-zoom; side panel stacks under circle on xl breakpoint | Inspector panel is full width under circle on mobile (long scroll); Face B photo sizes fixed |
| F25 | Generic Gathering schema (`schema/core.ts`) | schema/core | Defines Person/Group/Moment/Track/Media/Document/Gathering/Template/MatchingGoal | Types only | none | none | **NOT IMPLEMENTED** (in UI) | Type definitions are robust but unused; duplicate of `data/*` types | Parallel types will drift without consolidation |
| F26 | Multi-gathering support | — | Only one wedding hardcoded | — | — | — | **NOT IMPLEMENTED** | No gathering list, no creation flow, no switcher | — |
| F27 | Authentication / multi-user | — | None; single anonymous user profile (n1) | — | — | — | **NOT IMPLEMENTED** | localStorage is device-local; no accounts, no auth | — |
| F28 | Real-time sync / backend | — | None; fully client-side | — | — | — | **NOT IMPLEMENTED** | No WebSocket/Server-Sent Events/fetch | — |
| F29 | Orchestra engine (reactive) | useOrchestra | Scripted scenario only | Static SCENES | none | none | **DEMO** | No dependency graph, no real-time events, no approval flows, no audit history, no rollback | Hardcoded; cannot express "participant updates status" from UI |
| F30 | Undo / optimistic updates | — | None | — | — | — | **NOT IMPLEMENTED** | All edits persist immediately; no undo stack | — |
| F31 | Connection / sync indicator | Landing header | Green dot "Régie Live" always shows (pulsing) regardless of any connection | Static | n/a | n/a | **DEMO** | Indicator does not reflect actual connectivity | Misleading if presented as real-time |

---

## 3. Data-Flow Map

```
                         ┌──────────────────────────────┐
                         │     localStorage (browser)   │
                         │  regie.account.v2            │
                         │  regie.playlist.added.v1     │
                         │  regie.checks.v1             │
                         │  regie.signed.v2             │
                         └────────────▲─────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────────────┐
│                                     │            Client-only SPA            │
│                                     │                                        │
│  ┌──────────┐   ┌──────────┐   ┌────┴────┐   ┌───────────┐   ┌────────────┐  │
│  │  Landing │──▶│  Ripple  │◀──│useOrch.│   │AccountPage│◀──│ DocSheet   │  │
│  │ (hash)   │   │  (SVG)   │   │ (clock) │   │ (edits)   │   │ (preview)  │  │
│  └────┬─────┘   └────▲─────┘   └────┬────┘   └─────▲─────┘   └─────▲──────┘  │
│       │              │              │              │               │         │
│       │        ┌─────┴──────┐       │        ┌─────┴──────┐  ┌─────┴──────┐  │
│       │        │ data/*     │       │        │ data/      │  │  utils/    │  │
│       └───────▶│ networking │◀──────┘        │ account.ts │  │  pdf.ts    │  │
│                │ dayOf      │                └────────────┘  └────────────┘  │
│                │ playlist   │                                                │
│                │ memory     │     schema/core.ts + schema/mariage.ts          │
│                │ documents  │     ⚠ NOT IMPORTED BY ANY COMPONENT            │
│                │ orchestra  │                                                │
│                │ roles      │                                                │
│                │ weddingDat.│                                                │
│                │ guestStor. │                                                │
│                └────────────┘                                                │
└───────────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
  External images                        Web Audio API
  (picsum.photos,                        (synthesized SFX)
   pravatar.cc,
   unsplash.com)
```

**Key architectural observation:** There is no backend. All data is imported at bundle time. `schema/core.ts` represents an incomplete migration to a generic Gathering model that was started but never wired up.

---

## 4. Functional Risk Register

| Risk | Severity | Notes |
|---|---|---|
| Schema drift between `data/*` and `schema/core.ts` | **Medium** | Two parallel type systems; edits to one don't reflect in the other |
| localStorage quota exceeded by base64 avatar uploads | **Medium** | 5 MB limit common; data URLs can be 500 KB+ each |
| No backend — "Régie Live" pulse is misleading | **Low-Med** | Header shows green "live" dot even though nothing is live |
| 365 SVG line elements on calendar ring | **Low** | Acceptable on modern devices; flagged for performance review |
| clipPath id collision (`rp-p-${id}`) | **Low** | If multiple Ripple instances mount, duplicate ids break clipping |
| Night theme uses pervasive `!important` | **Medium** | Will break new components if colors aren't expressed with CSS variables |
| Orchestration is a canned 56-min loop | **High** (for real-time ambition) | Cannot model actual state changes, user approvals, or cross-client sync |
| Single user profile (n1) only | **Medium** | Editing always overwrites Antoine Moreau; other people are static |
| Single-page vite-plugin-singlefile bundles to 413 KB | **Low** | Acceptable; grows as we add features |
| External image dependencies (picsum, unsplash, pravatar) | **Low-Med** | Offline/demo environments fail to load photos |
| French-only UI labels | **Low** | Not a bug, but i18n is not structured for future templates |

---

## 5. Proposed Target Architecture (for later phases)

```
src/
├── app/                      # App shell, router, providers
├── domain/                   # Invariant domain models (consolidated from schema/core)
│   ├── gathering.ts
│   ├── person.ts
│   ├── moment.ts
│   ├── media.ts
│   ├── document.ts
│   ├── relationship.ts
│   └── timeline.ts
├── engine/                   # Pure logic (no React)
│   ├── orchestra/            # Dependency graph, delay propagation
│   ├── matching/             # Rule-based synergy + interest matching
│   ├── time/                 # Multi-scale circular projection
│   └── permissions/
├── features/                 # Feature modules (React)
│   ├── ripple/               # Circular visualization (refactored from Ripple.tsx)
│   ├── gathering/            # CRUD, templates
│   ├── inspector/            # Universal contextual inspector
│   ├── account/
│   ├── documents/
│   └── onboarding/
├── data/                     # Demo fixtures + templates
│   ├── templates/            # wedding.ts, conference.ts, networking.ts ...
│   └── fixtures/
├── hooks/
├── components/ui/            # Shared primitives
├── backend/ (Phase 3+)       # Optional: server (Bun/Node + Postgres + realtime)
└── utils/
```

**Preservation strategy:**
- All existing `data/*` wedding fixtures remain importable as the "Wedding (Chantilly 2026)" demo template.
- The `Ripple.tsx` component is split into focused sub-components (rings, needle, center-card) without changing visual output.
- All CSS variables (`--ripple-ink`, `--ripple-surface`, etc.) remain intact.
- localStorage keys (`regie.account.v2`, etc.) keep their formats to preserve existing user edits.

---

## 6. Implementation Backlog (Phases 1–6)

### Phase 1 — Stabilize the existing Ripple (this branch)
1. ✅ Baseline audit & build verification
2. Consolidate types: re-export domain types from one place, mark legacy types
3. Split Ripple.tsx into focused sub-components while preserving all visuals
4. Fix chord rendering (LINKS computed but never drawn) — subtle connection lines
5. Extract ring geometry constants into a shared config (prep for generic templates)
6. Add missing master mute toggle for audio
7. Fix clipPath id collision
8. Add pinch / wheel zoom
9. Improve keyboard support (Esc closes doc, focus trap)
10. Create proper universal inspector panel (unify SelectionDetail)
11. Make "live" indicator reflect actual state (paused/manual/live)
12. Replace CSS `!important` overrides with proper CSS variable inheritance
13. Keep the wedding demo 100% recognizable

### Phase 2 — Generalize Gathering model
1. Make `schema/core.ts` the authoritative type source, with adapters for legacy data
2. Create multi-gathering workspace UI
3. Add 2 templates (wedding + business networking) using same engine
4. Add gathering CRUD with localStorage persistence
5. Separate demo content from user content

### Phase 3 — Persistent collaboration
1. Introduce auth layer (starting with local multi-profile, then backend)
2. Add optional backend: Bun + Postgres + Realtime (not yet connected by default)
3. Gathering membership + invitations
4. Server-side isolation

### Phase 4 — Living orchestration
1. Real moment status state machine (planned→confirmed→active→…)
2. Dependency graph and delay propagation
3. Proposed vs confirmed adjustments with approval
4. Audit history

### Phase 5 — Relationships & shared experiences
1. Improve matching transparency ("Why am I seeing this?")
2. Opt-out controls
3. Collaborative media uploads
4. Music scheduling with actual cue triggers

### Phase 6 — Product validation
1. End-to-end multi-user demo with fictional identities
2. Accessibility audit
3. Performance profiling
4. Deployment readiness

---

## 7. Phase 1 Verification Method

Each Phase 1 change will be verified by:
1. `npm run build` — must succeed with zero TypeScript errors
2. Visual diff — the wedding demo must render identically to baseline when not interacting
3. Functional smoke:
   - All 7 layers navigate
   - Face A / Face B flip
   - Zoom / pan works
   - Needle rotation and person selection work
   - Cross-layer highlighting fires for person/moment/track/memory selections
   - Account edits persist across reload
   - Document preview opens, PDF downloads
   - Day/night theme switches
   - Keyboard navigation works
4. Manual QA against the baseline checklist above
