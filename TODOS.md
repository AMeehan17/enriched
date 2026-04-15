# TODOs

Things we know we want but haven't built yet. Organized by area, priority-tagged.
The bar for adding something here is low. The bar for removing it is high — if a
bullet sits here untouched for months, that's a signal about its actual priority.

## compare (module 1)

### Time-passage animation
**Priority:** P2
**Added:** 2026-04-13

A play button for the year slider. User picks a start year and an end year, hits
play, and watches the time-varying dimensions (LCOE, capacity factor, any future
history arrays) shift frame-by-frame. Bars animate to each year's values. The
static dimensions (lifecycle CO₂, land use, energy density, construction time,
load profile) stay flat — their dim-header italic already says "does not vary
year-over-year," so the animation naturally highlights which dimensions carry
real temporal stories.

Implementation sketch:
- Add `playbackState: "paused" | "playing"`, `playbackStart: number`,
  `playbackEnd: number` to URL state via nuqs.
- Play button triggers a requestAnimationFrame loop that steps `year` from
  start to end over ~5–10 seconds (configurable speed).
- Pause/reset controls.
- Respect `prefers-reduced-motion` — if user has it set, step through years
  without interpolation, or disable animation entirely.
- Visual: maybe a second marker on the existing year slider showing the
  playback range, with a thin accent-colored line sweeping through it.

Why this matters: solar LCOE 2013 → 2024 is the single most persuasive data
point on the whole site, and right now users have to manually drag the slider
to see it. An autoplay makes that reveal happen on its own.

### SVG pattern fills for bars
**Priority:** P2
**Added:** 2026-04-13

Color-blind accessibility per DESIGN.md. Each bar gets a subtle pattern fill
(diagonal lines, dots, crosshatch) layered over the rust fill so color is never
the only distinguishing feature. Also helps in B&W print-outs and screenshots.

### Lazard v3–v6 LCOE backfill (2009–2012)
**Priority:** P3
**Added:** 2026-04-13
**Blocked on:** primary-source PDFs

We have Lazard v7 (2013) through v18 (2024) in the history arrays. Adding v3–v6
would extend the LCOE story back to 2009, right when utility-scale solar was
just becoming a real category.

**Blocker discovered 2026-04-13:** the `Lazard Reports/` folder only has PDFs
back to v7. There are no v3, v4, v5, or v6 PDFs on disk, and the extraction
draft at `data-src/drafts/lazard-lcoe-extraction.md` only covers v12–v18.
Landing this backfill requires either:

1. Acquiring the v3–v6 PDFs directly from Lazard's archive and extracting
   the unsubsidized midpoint values the same way the existing history
   entries were extracted. Preserves the "every value cited direct from
   primary source" brand rule. **Preferred.**
2. Pulling v3–v6 values from secondary sources (Carbon Brief, RMI, IEA WEO,
   academic papers that republish Lazard retrospective tables) and marking
   the citations as secondary. Compromises primary-source provenance.

Option 1 stays blocked until the PDFs are in hand. Option 2 needs explicit
scope approval because it breaks the citation promise.

## platform

### OG image route
**Priority:** P2
**Added:** 2026-04-13

`/og/compare` via Satori — renders a URL's state as a static 1200×630 PNG for
social sharing. Preset + sources + year baked into the image. Research draft
sits in `data-src/drafts/og-satori-patterns.md`. The whole "rebuttal in a link"
story depends on this — right now a shared Enriched link shows up as a plain
Next.js default card.

### Accessibility pass
**Priority:** P2
**Added:** 2026-04-13

Keyboard nav, axe-core run, VoiceOver sweep. Dim-header semantic tags. Focus
indicators on every interactive. ARIA live regions for value changes when the
year slider moves.

## Completed

_(Nothing yet. Things move here when they ship.)_
