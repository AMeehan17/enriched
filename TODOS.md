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

### Tangible "relative" framings anchored to 1 GW continuous
**Priority:** P2
**Added:** 2026-04-15

Raw academic units (km²/TWh/yr, gCO₂eq/kWh, deaths/TWh) are precise but don't
land emotionally. A general reader or investor reading "0.3 km²/TWh/yr" has
no intuition for what that means. Anchoring the display to a concrete reference
point makes the numbers visceral without sacrificing accuracy.

**The anchor: "1 GW continuous plant."** That's how the data-center / AI energy
buildout conversation is already framed. When someone says "we need 1 GW of
compute power," they mean 1 GW delivered 24/7. The math is:

```
1 GW × 8760 h/year = 8760 GWh/year = 8.76 TWh/year
```

So any per-TWh metric can be multiplied by 8.76 to reframe as "for a 1 GW
continuous plant, that's X." Capacity factor is already baked into per-TWh
metrics (TWh is delivered energy, not nameplate), so no CF adjustment is
needed in the conversion — it's a simple scalar ×8.76.

**Land use pilot (the cleanest example, validated during the 2026-04-15 session):**

| Source | Raw (km²/TWh/yr) | 1 GW continuous (km²) |
|--------|------------------|-----------------------|
| Nuclear | 0.3 | ~2.6 |
| Solar | 13.5 | ~118 |
| Wind | 1.3 | ~11 (direct only — see caveat) |
| Gas | 0.4 | ~3.5 |
| Coal | 1.0 | ~8.8 |
| Hydro | 18 | ~158 (reservoir area) |

Wind's direct land use is much lower than most readers expect because the
Brookings source measures just turbine pads and access roads, not the gross
spacing footprint. Worth a caveat inline or in the cite popover.

**Implementation sketch (~20–30 min):**

1. Add `areaForContinuousGW(kmSqPerTWhYr)` to `lib/chart-math.ts` (pure, 1 line:
   `return kmSqPerTWhYr * 8.76`). Unit test with the values above.
2. Extend `adjustForEnergyBasis()` in `ChartGrid.tsx` to handle `landUse` same
   way it handles `constructionTime` today — return transformed value.
3. Update `DIMENSION_META.landUse` unit label from "km² per TWh per year" to
   "km² for a 1 GW continuous plant."
4. Update `formatValue()` landUse branch for the new value range (2.6 → ~158).
5. Bar scaling works unchanged — ratios are preserved by the ×8.76 multiplier.

**Neutrality check to do before shipping:** the transformation makes nuclear
look dramatically better on land use (2.6 vs 118 km² for solar). This is the
data, not editorializing — but the FRAMING choice to anchor on "1 GW plant"
is itself a perspective. Run this through the same neutrality filter that
killed the energy density headline. The defensible position: this IS how
the industry talks about load, and showing what the numbers mean in that
frame is informative, not opinionated.

**Potential extensions to other dimensions** (defer until land use pilot
validates the pattern):

- **Lifecycle CO₂**: gCO₂eq/kWh → "tons of CO₂ per year for a 1 GW plant."
  At 12 g/kWh for nuclear × 8.76 TWh = ~105,000 tons/year. Coal at ~820 g/kWh
  = ~7.2 million tons/year. The gap becomes tangible.
- **Deaths per TWh**: × 8.76 = "statistical deaths per year for a 1 GW plant."
  Small numbers get smaller (nuclear ~0.6/yr, coal ~216/yr) but the ratio
  holds and the "deaths per year" framing is more visceral than "deaths per
  terawatt-hour" for most readers.
- **LCOE**: $/MWh is already pretty intuitive, less urgency.
- **Capacity factor**: already a % of ceiling, doesn't need a tangible frame.

**Pick carefully.** The editorial-headline mistake on energy density taught
us that concrete framings can smuggle in bias. Each dimension's analogy
needs its own neutrality audit before it ships. Start with land use only,
review together, then roll out.

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
