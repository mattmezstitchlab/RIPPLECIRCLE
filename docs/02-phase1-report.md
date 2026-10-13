# RIPPLECIRCLE — Phase 1 Report

**Branch:** `feat/ripplecircle-evolution`
**Baseline commit:** `5ae14ae` (Initialisation RIPPLECIRCLE)
**Head commit:** see `git log -1`
**Build:** ✅ `npm run build` succeeds (430 KB, 130 KB gzipped)
**TypeScript:** ✅ `tsc --noEmit` reports zero errors

---

## Phase 0 Deliverable: Baseline Audit

- `docs/00-baseline-audit.md` — full architecture inventory, 31-row feature matrix, data-flow map, risk register, backlog.
- `docs/01-architecture-decisions.md` — 8 recorded ADRs.

Key findings from the audit:
- The repo builds cleanly; React 19 + Vite 7 + Tailwind 4.
- Two parallel type systems existed: `data/*` (consumed by UI) and `schema/core.ts`+`schema/mariage.ts` (unused).
- The Ripple SVG had relationship chord data (`LINKS`) but never rendered it.
- Orchestration was a pre-scripted 56-minute loop; no reactive state, no user decisions, no audit.
- All persistence was localStorage; no backend; no multi-user.
- Clip-path IDs in the SVG collided if two Ripple instances mounted.
- Night theme relied on 9 `!important` overrides that would break new components.
- The "Régie Live" green dot was permanently pulsing even when paused or scrubbing.
- No audio mute toggle; no wheel zoom; no Escape-to-close on the doc modal.

---

## Phase 1 Changes Implemented

### Preservation
- Wedding demo renders identically to baseline (color palette, layout, typography, data, timing).
- All existing localStorage keys preserved (`regie.account.v2`, `regie.checks.v1`, `regie.signed.v2`, `regie.playlist.added.v1`).
- All existing interactions work: layer navigation, needle drag, face A/B flip, zoom/pan, account edits, document preview & PDF generation.

### Architecture
- Created `src/ripple/config.ts` — extracted geometry constants (SIZE, CENTER, RINGS, ZOOM bounds, PAN_MAX, palette) into a template-configurable object, plus `RippleTemplateConfig` interface for future gathering templates.
- Created `src/engine/orchestra/types.ts` — authoritative types for lifecycle states (`planned/confirmed/active/delayed/completed/cancelled/attention`) and provenance labels (`observed/predicted/proposed/confirmed`) following the master-prompt vocabulary.
- Created `src/engine/orchestra/useReactiveOrchestra.ts` — first vertical-slice engine with moment state, proposals, accept/reject, audit log, role switching, reset. Persists to `ripple.orchestra.v1` localStorage key.

### Bug fixes
- **Clip-path ID collision.** Each Ripple instance now uses a unique `instanceId` prefix (`r{random}-p-{id}`), fixing invalid HTML that would break avatar clipping if multiple Ripple instances mounted.
- **Zoom bounds hardcoded in three places.** Consolidated to `ZOOM_MIN/MAX/STEP`/`PAN_MAX` constants.
- **Pan bounds hardcoded to ±280.** Replaced with `PAN_MAX` constant.
- **Doc sheet couldn't be closed with Escape.** Added global keydown listener.
- **Live indicator always green.** Replaced with accurate status chip showing *Démonstration / Pause / Temps manuel* with matching colors.

### UX improvements
- **Wheel / trackpad zoom.** Ctrl/Cmd-wheel and regular wheel now zoom the circle anchored at the cursor position (not just the +/- buttons).
- **Audio mute toggle.** New speaker button persists to `regie.audio.v1`; defaults to muted when `prefers-reduced-motion` is set.
- **Chord rendering.** Subtle quadratic-curve links between synergistic people are now drawn inside the center disk. They stay faint (0.22 opacity) when viewing overview and brighten to full opacity when the person at one end is focused. No "spider web" clutter in overview.
- **Demo transparency badge.** A blue "DÉMONSTRATION · Données fictives" chip at the bottom explicitly labels the fictional wedding content, per the master prompt's "do not present simulated as production" rule.
- **Semantic surface classes.** Added `.ripple-card`, `.ripple-pill`, `.ripple-demo-badge` that respond to `.theme-day` / `.theme-night` without `!important`, reducing reliance on hardcoded overrides.
- **Moment lifecycle badge.** When a moment is selected in the inspector, a colored pill shows its current reactive state (Planifié / Confirmé / En cours / En retard / Attention…).

### Vertical slice: Interactive orchestration
A new **ActionPanel** in the inspector sidebar delivers the required first user journey:

1. **Role switcher** simulates 5 fictional identities (Planner Éléonore, Traiteur Mathilde, Témoins, Mariés, Invité Antoine) — each with different permissions.
2. **Pending proposals panel** shows the system-recommended adjustment (e.g., "Avancer le dessert de 10 min") with reason + downstream consequence.
3. **Accept / Reject buttons** are shown only to the `planner` role (authorization gating). Other roles see an explanatory "only the planner can validate" note.
4. **Status actions** — authorized roles can mark an "attention" moment as Démarrer / Terminé; state flows to the moment lifecycle.
5. **Moments under surveillance** list automatically highlights delayed/attention moments with colored dots.
6. **Audit log** shows the last 12 actions with timestamp, actor label, message, and a provenance badge (Observé / Prédit / Proposé / Confirmé) — per the OBSERVED/PREDICTED/PROPOSED/CONFIRMED distinction in the master brief.
7. **Reset demo** button returns to the baseline scenario (caterer +12 min delay awaiting planner decision).
8. **State persistence** — all changes persist across reloads via `ripple.orchestra.v1`.
9. **Inspector integration** — selecting a delayed moment (d7 — Retard traiteur) in the Ripple shows its reactive lifecycle badge immediately.

### Ripple center disk ref
- The hardcoded `r={148}` is now `R.centerDisk` to match config.

### Vite config
- Added `server.allowedHosts: true` and `preview.allowedHosts: true` so the dev preview works in sandboxed preview hosts.

---

## Files Changed / Added

```
ADDED   docs/00-baseline-audit.md
ADDED   docs/01-architecture-decisions.md
ADDED   docs/02-phase1-report.md
ADDED   src/ripple/config.ts
ADDED   src/engine/orchestra/types.ts
ADDED   src/engine/orchestra/useReactiveOrchestra.ts
ADDED   src/components/landing/ActionPanel.tsx
MODIFIED src/components/landing/Ripple.tsx          (geometry constants, chords, audio mute, wheel zoom, clip ids, ActionPanel wired, lifecycle badge)
MODIFIED src/components/landing/Landing.tsx         (live-state indicator, role icon import)
MODIFIED src/components/landing/DocSheet.tsx        (Escape-to-close)
MODIFIED src/index.css                              (new semantic classes, demo badge, ripple-card/ripple-pill)
MODIFIED vite.config.ts                             (allowedHosts for sandbox preview)
```

---

## Features Still Simulated / Not Implemented (honest status)

| Capability | Status in Phase 1 |
|---|---|
| Multi-user realtime sync | **Not implemented** — single-browser, localStorage. Labeled "Démonstration". |
| Authentication | **Simulated** — role switcher, no real accounts. |
| Backend / database | **Not implemented** — Phase 3. |
| Audio playback / streaming | **Not implemented** — cues are visual only; SFX are synthesized. |
| Generic multi-Gathering workspace | **Foundations laid** (config, template interface) but UI still shows the wedding demo. |
| AI orchestration | **Not implemented** — deterministic rules only, interface prepared. |
| File uploads beyond avatar | **Not implemented** — media placeholders (picsum). |
| E-signatures / payments | **Clearly simulated** (local boolean); no legal or financial action. |
| Dynamic matching graph editor | **Not implemented** — matching still uses static SYNERGIES pairs. |

---

## Tests Executed

| Check | Command | Result |
|---|---|---|
| TypeScript strict | `npx tsc --noEmit` | ✅ 0 errors |
| Production build | `npm run build` | ✅ builds in ~3s, 430 kB bundle |
| Dev server starts | `npm run dev` | ✅ Vite ready in 276ms |
| Install integrity | `npm install` | ✅ 122 packages, 5 vulns (pre-existing, dev deps) |
| Visual smoke | manual (dev server) | ✅ Ripple renders; all layers navigable; face A/B flip works; chord lines visible on focused person; ActionPanel functional; accept/reject updates state; persistence survives reload; day/night theme switches; Escape closes doc; wheel/pinch zoom works; mute toggle works |

Automated unit/integration/e2e tests were not added in Phase 1 (the project had zero tests at baseline, and the master prompt prioritizes a working vertical slice over scaffolding test harnesses without a test runner configured). A testing setup (Vitest + React Testing Library) is recommended in Phase 2 along with the Gathering CRUD.

---

## Known Limitations

1. **Chord density.** When a person has many synergies (e.g., n1 startup with 4+ partners), multiple chords radiate. They are low-opacity but may still look busy in overview — this is intentional for now; future Phases will add a hover/focus-only reveal or intensity slider.
2. **Delay propagation is simple.** The engine only recognizes the traiteur-delay scenario with pre-identified downstream moments. A general dependency DAG is Phase 4.
3. **Role-based auth is cosmetic.** The role switcher is a demo control; there is no server-side permission check. This is acceptable for Phase 1 per the prompt ("if a backend is not yet available, implement and clearly label an isolated local demonstration").
4. **External image dependencies.** Photos still load from `i.pravatar.cc`, `picsum.photos`, and `images.unsplash.com`. Offline use will show broken avatars. A future Phase should bundle demo avatars.
5. **Calendar ring renders 365 SVG lines.** Acceptable for desktop; flag for performance review in Phase 2 (could be batched into month segments).
6. **PDF generator** has a basic manual page-break API (`need(h)`); complex long documents may overflow (pre-existing, preserved).
7. **Interest type duplication** between `data/networking.ts` and `schema/core.ts` remains. Phase 2 will consolidate to a single `domain/` module.
8. **French-only UI.** The wedding demo is in French; i18n is not structured yet. Template vocabulary switching exists in `schema/core.ts` GatheringTemplate.words but is not wired up.

---

## First Vertical Slice — Walk-through

A reviewer can verify the required user journey by:

1. `npm run dev` → open the preview.
2. Look at the right sidebar → **Régie · Orchestration** card is visible, pre-loaded with the caterer delay scenario.
3. The "En tant que" role chips default to **Planner** (authorized).
4. A pending proposal "Avancer le dessert de 10 min" is visible with reason and consequence; **Proposé** provenance badge.
5. Click **Accepter** → proposal moves to accepted, attention moments clear, a **Confirmé** audit entry is added ("Proposition acceptée").
6. Click **Refuser** on a fresh demo (hit "Démo" reset) → proposal rejected, red confirmation in audit.
7. Switch role to **Invité** → buttons are disabled with an explanatory notice (permission gating).
8. Switch to **Traiteur** → "Démarrer" / "Terminé" buttons are available on moments (service role can report state).
9. Click a moment on the Ripple (e.g., the red "!" node at 21:08) → the inspector shows the lifecycle badge "En retard · +12 min".
10. Refresh the page → state persists (localStorage).
11. Click "Démo" reset → scenario returns to initial pending state.

Everything uses real application state — not hardcoded animations — and every decision is recorded in the audit log with provenance.

---

## What Comes Next (Phase 2)

- Consolidate types into `src/domain/`, retire the `schema/core.ts` duplication.
- Multi-Gathering workspace with a Gathering switcher and localStorage persistence.
- Add a second template (e.g., "Business Networking") using the same Ripple engine to prove generalization.
- Separate demo content from user data explicitly.
- Add a proper Vitest test harness with tests for radial geometry, time projection, and orchestration state transitions.
