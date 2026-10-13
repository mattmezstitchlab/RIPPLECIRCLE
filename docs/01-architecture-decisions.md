# RIPPLECIRCLE — Architecture Decisions

## ADR-001: Incremental refactor over rewrite
**Status:** Accepted
**Context:** The existing Ripple.tsx (1933 lines) renders correctly and the build passes. The code mixes geometry constants, data loading, interactive logic, and multiple sub-views in one file.
**Decision:** Phase 1 surgically extracts constants and utilities into new modules without renaming or breaking the rendering. No "big rewrite" until vertical slices are verified.
**Consequences:** Some duplicated types remain until Phase 2. Existing wedding demo is preserved bit-for-bit visually.

## ADR-002: Keep localStorage persistence through Phase 2
**Status:** Accepted
**Context:** All editable state (account, checks, signatures, added tracks) is in localStorage. Users who have edited their profile on a deployed demo would lose data if keys change.
**Decision:** Keep localStorage keys (`regie.account.v2`, `regie.checks.v1`, `regie.signed.v2`, `regie.playlist.added.v1`) stable through Phase 2.
**Consequences:** Schema migrations for these keys must be additive only.

## ADR-003: No backend by default
**Status:** Accepted
**Context:** The repository has no server, no database credentials, and no deployed environment. Claiming a real-time backend would be misleading.
**Decision:** Phase 1-2 ship as a fully client-side app with a clearly labeled "simulated orchestration." Phase 3 introduces an *optional* local backend (Bun + SQLite/Postgres) gated behind an environment flag.
**Consequences:** Multi-user functionality is simulated with multiple fictional profiles in-browser until Phase 3.

## ADR-004: CSS variables for theming (replace !important overrides)
**Status:** Accepted
**Context:** `.theme-night` uses 9 `!important` rules to override hardcoded Tailwind arbitrary colors. This breaks new components that use the same class names.
**Decision:** Migrate hardcoded inline/arbitrary colors to `var(--ripple-*)` references. Night theme swaps only CSS variables, no selectors.
**Consequences:** Small refactor pass; new components automatically support day/night.

## ADR-005: SVG chord links are subtle, not decorative
**Status:** Accepted
**Context:** The `LINKS` array is computed but never rendered; the synergy engine has data that the UI does not visualize.
**Decision:** Render relationship chords as very thin, low-opacity quadratic curves between related people. They brighten only when the relationship is in context (related set). No distracting spider web.
**Consequences:** Selecting a person now shows *why* the connection exists in the visual field as well as the inspector.

## ADR-006: Template-agnostic ring configuration
**Status:** Accepted for Phase 1 (partial)
**Context:** Ring radii and layers are currently hardcoded wedding geometry. Future gatherings may hide or reorder rings.
**Decision:** Extract ring radii and layer labels into a `rippleConfig` object that the template can override. Phase 1 ships with one config (wedding) but the interface supports future templates.
**Consequences:** Backward compatible; new templates don't require editing the Ripple component.

## ADR-007: Orchestration status is OBSERVED until explicitly confirmed
**Status:** Accepted for Phase 1 labeling
**Context:** The current "delay detected" narrative is displayed as fact. The product principle requires OBSERVED/PREDICTED/PROPOSED/CONFIRMED distinction.
**Decision:** Phase 1 labels moments and orchestra scenes with explicit provenance badges (Observation / Prédiction / Confirmé). Phase 4 builds the actual approval workflow.
**Consequences:** Users can distinguish demo-scripted content from reactive updates.

## ADR-008: Audio respects global mute
**Status:** Accepted
**Context:** `sfx` is enabled by default and plays on every click. No user-facing mute exists.
**Decision:** Add a global audio mute toggle (persisted in localStorage). Respects reduced-motion preference (muted by default when reduced-motion is set).
**Consequences:** Accessibility improvement; new preference stored under `regie.audio.v1`.
