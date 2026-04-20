# TODOs

Things we know we want but haven't built yet. Organized by area, priority-tagged.
The bar for adding something here is low. The bar for removing it is high — if a
bullet sits here untouched for months, that's a signal about its actual priority.

See `CLAUDE.md` for the Enriched vs NPV scope boundary and the security rule.
Module 2 and 3 additions below respect that split — nothing here implies
putting company underwriting content into this repo.

## module 4 (reactor database, queued behind module 2)

### Reactor Database — editorial transformation of PRIS data
**Priority:** P2 (starts AFTER Module 2 v1 ships and dogfood completes)
**Added:** 2026-04-19
**Design doc:** `~/.gstack/projects/Enriched/andrew-main-design-20260419-211344.md` (APPROVED)

Transform IAEA PRIS's "wall of tables" into the Enriched editorial aesthetic.
v1 is US operating fleet only (~90 reactors). Landing = beautifully-typeset
editorial table (sortable, filterable, searchable). Click any row → per-reactor
page with editorial blurb, historical capacity factor chart, construction
timeline, link to Module 2 design it instantiates, primary-source citations.

**Gated on Module 2 shipping.** Do not start Block 0 until Module 2 v1 is in
production and the 10-human dogfood pass is complete.

**v1 block sequence (~6-7 working weeks total):**
- Block 0: PRIS extraction research spike (~0.5 day)
- Block 1: types + data pipeline (~1 day)
- Block 2: data acquisition + editorial blurbs (~2 weeks — revisit after Block 0)
- Block 3: table + filter UI (~3-4 days)
- Block 4: per-reactor page shell + editorial (~2 days)
- Block 5: capacity factor chart (~1-2 days, independently cuttable)
- Block 6: construction timeline viz (~1-2 days, independently cuttable)
- Dogfood pass (~2-3 days)

**v2 (future):** map + timeline view — watch the 70s construction boom bloom
across the world. Timeline alone is weak; timeline + map is the whoa.

**v3 (vision):** AI-access layer — MCP server + public API so agents can
query and cite Enriched data alongside human readers. First vertical-domain
MCP server in nuclear.

**Assignment (before Block 0 ever runs):** spend 30 min clicking through 5-10
US reactor pages on IAEA PRIS (pris.iaea.org). Note what data you WISH was
rendered differently. Becomes the editorial brief for Block 2.

**Scope boundary (per CLAUDE.md §3):** operator names + public URLs only.
No scores, funding, underwriting judgments. Notable events use objective
criteria only (NRC scrams, Level I-III violations, INES-rated incidents,
commissioning milestones). Economic/political context explicitly excluded.

## module 2 (reactor builder, future)

### Reactor Builder — interactive configurator
**Priority:** P1 (next module after Module 1 polish)
**Added:** 2026-04-15

The public teaching tool that teaches what it takes to build a nuclear reactor.
User picks a Fuel / Coolant / X-Factor combination; the tool shows what those
choices mean physically, what trade-offs they imply, and what in-development or
historical reactor designs match the configuration. Teaching tool, not a
database. Companies appear only as "here's who's pursuing this design," with
a link out — never as business-landscape profiles.

**Conceptual paradigm** (from the NPV SPV I deck, adapted):
- **Fuel**: LEU-UO₂ / HALEU metal / TRISO pebbles / molten fuel salt / thorium / MOX
- **Coolant**: light water / heavy water / helium / FLiBe salt / sodium / lead / heat pipes
- **X-Factor**: controlled-vocab tag array covering scale (micro/small/mid/large),
  form factor, distinctive capability (load-following, walk-away-safe, process
  heat, thermal storage, first-of-kind licensed, etc.)

Each tag is a glossary entry that deep-links into Module 3.

**Scope boundary (per CLAUDE.md):** Enriched Module 2 is about reactor DESIGN,
not reactor COMPANIES. Any company profile content — who's raised how much,
who's on the board, who has PPAs, L/M/H underwriting scores — belongs in the
NPV-side private tool, not here. The 18-company working spreadsheet in the
G-drive reference folder is valuable as architectural input for the Fuel /
Coolant / X-Factor taxonomy, but the business fields (Key Supporters, jobs
posted, probability scores) are explicitly out of Enriched scope.

**Status (2026-04-15):** office-hours has run. Design doc approved, lives at
`~/.gstack/projects/Enriched/andrew-main-design-20260415-153112.md`. Key
outcome: Module 2 split into two separate shipments. Module 2 v1 = configurator
+ chip popovers only (~7 working days), data-first build order. Module 3
(Learn) is a separate future ship. Popovers written for Module 2 become seed
content for Module 3 articles — zero rework.

**Headline aha path:** walk-away-safe = coolant (the safety reframe), delivered
in v1 as a canned preset link at the top of the page. Cross-dimension chip
graying deferred to v1.1.

**v1 launch blockers (in order):**
1. Block 1 — `lib/reactor-taxonomy.ts` locked with ~25 F/C/X tags,
   each with label + oneLineHook + popoverBody + citations, + `lib/citation-allowlist.ts`
2. Block 2 — `data/reactors.json` with exactly 6 designs tagged against
   the taxonomy (AP1000, VOYGR/NuScale, Xe-100, BWRX-300, Natrium, Kairos KP-FHR)
3. Block 3 — `lib/reactor-match.ts` pure function + ≥10 unit tests
4. Block 4 — `/reactor-builder` route, multi-select chips, nuqs state, popovers,
   MatchList, aria-live, walk-away-safe preset, nav entry

**Next step:** run `/plan-eng-review` on the design doc before any code.
Then `/plan-design-review` is optional (chip UI reuses Module 1 patterns but
the gray-out interaction is new — though deferred to v1.1, so low risk).

**Scope boundary reminder (per CLAUDE.md §3):** company IDs are allowed in
Module 2 output as purely descriptive attributions — `pursuedBy: [{name, url}]`
on each matching design, pointing to public company materials. No scores,
no funding, no underwriting. Grep test pre-launch: `scored`, `underwrite`,
`LP`, `confidential`, `Pitchbook` must return zero hits anywhere in the
Module 2 tree.

## module 2 v1.1+ (post-launch, from CEO review 2026-04-15)

### Reactor comparison mode
**Priority:** P2
**Added:** 2026-04-15 (CEO review)
**Depends on:** Module 2 v1 shipped + validated

Pick two or more real-world reactor designs from the matching list and compare
them side-by-side across physical parameters (outlet temp, spectrum, fuel
burnup, scale). Reuses Module 1's comparison interaction pattern — different
data, same UI. Estimated effort: ~2-3 days CC time. Ship when v1 configurator
is validated by dogfood.

### Timeline dimension
**Priority:** P3
**Added:** 2026-04-15 (CEO review)
**Blocked on:** reliable milestone data for all designs

Each matching reactor shows its development arc: R&D start, regulatory review,
expected licensing, expected first operation. Horizontal timeline bar per design.
Blocked on data availability — not all 6 starting designs have public milestone
dates. Estimated effort: ~1-2 days CC once data is sourced.

### "No match" as physics explanation
**Priority:** P3
**Added:** 2026-04-15 (CEO review)

When no current designs match a combination, instead of a neutral "no match"
card, show computed physical constraints and a "why nobody's building this"
explanation (e.g., "lead-cooled + thorium requires reprocessing infrastructure
that doesn't exist commercially"). Content-heavy: requires deep physics writing
for every common impossible combination. Estimated effort: ~2-3 days CC
(mostly content).

### Live constraint physics computation
**Priority:** P4 (vision)
**Added:** 2026-04-15 (CEO review)

When you pick a fuel + coolant, the spec card computes and displays the
physical consequences: outlet temp range, neutron spectrum, thermal efficiency,
max burnup. The physics is calculated, not looked up. Requires a physics
model engine — months of R&D. The ultimate version of the teaching
experience but the farthest from shippable.

### LLM-powered natural language search
**Priority:** P4 (vision)
**Added:** 2026-04-15 (CEO review)

Type "show me small reactors that can do process heat" and the tool maps it
to F/C/X tags. LLM-powered search as an alternative entry point to the chip
configurator. Concerns: latency, accuracy, cost. Defer until the F/C/X
taxonomy is proven and the dataset is larger (>15 designs).

## module 3 (reference library, future)

### Reactor science and history reference
**Priority:** P2
**Added:** 2026-04-15

Deep-dive articles on the physics, engineering, and history behind reactor
design. Feeds Module 2 with "click to learn more" links on every F/C/X
glossary tag. Not a textbook from scratch — an opinionated curated path
through the existing public primary-source literature, with Enriched's
narrative voice stitching the references together.

**Target chapters (rough sketch):**
- Fission physics (cross-sections, neutron spectrum, criticality, breeding)
- Fuel cycles (mining → enrichment → fabrication → burnup → spent fuel → waste)
- Moderators and coolants (why the choices, what the trade-offs)
- Safety physics (decay heat, passive cooling, walk-away, TMI/Chernobyl/Fukushima)
- Reactor history (Chicago Pile 1 → commercial LWR era → advanced reactors)
- Fuel format deep dives (TRISO, MOX, thorium, molten salt fuel)
- Regulatory landscape (NRC, IAEA, CNSC, ONR — who regulates what, how paths differ)

**Citation sources (all public, all independently verifiable):**

*Regulators and international bodies:*
- IAEA: Status of Molten Salt Reactors (2021), Thorium Fuel Cycle, Advanced
  Reactor Information System (ARIS) database
- NRC: Advanced reactor licensing roadmap, ADAMS document database
- ENSREG, CNSC, ONR: national regulator frameworks

*US Department of Energy:*
- Advanced Reactor Demonstration Program (ARDP) docs
- Advanced Nuclear Liftoff Report
- Office of Nuclear Energy publications
- National lab output (ORNL, INL, ANL, PNNL, LLNL, PSI)

*US Energy Information Administration:*
- Annual Energy Outlook (AEO)
- Electric Power Monthly
- Monthly Energy Review

*Industry associations (public):*
- World Nuclear Association reactor database + World Nuclear Performance
  Reports
- Nuclear Energy Institute publications

*Peer-reviewed:*
- IEEE Transactions on Nuclear Science
- Nuclear Engineering and Design
- Progress in Nuclear Energy
- Conference proceedings (ANS, ENC, ICAPP)

**Research rule (enforced by CLAUDE.md §5):** proprietary analyst subscriptions
(Pitchbook, paid industry research, internal decks) may be consulted by the
author for background and context, but every fact on the public site must
cite a primary source a reader can independently verify. No paywalled
citations, no "trust me, I read it in a private report" claims. If a useful
stat lives behind a paywall, find the underlying SEC filing / DOE announcement
/ academic paper / company press release the paywalled report itself used
and cite that instead.

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

### OG image route + Module 2 per-configuration OG (bundle)
**Priority:** P2
**Added:** 2026-04-13, updated 2026-04-15

`/og/compare` already exists at `app/og/compare/route.tsx` (Module 1). When
Module 2 ships v1.1 OG images, add `/og/reactor-builder` using the same
Satori codepath. Bundle both as a single v1.1 effort — shared helper for
Satori rendering, shared font loading, per-module route handlers. Don't do
Module 2 OG independently.

Context: Module 2 v1 ships WITHOUT per-configuration OG (shared URLs get a
generic card). Adding OG is the first v1.1 item. Per-config OG also means
`generateMetadata` reading `searchParams`, which forces dynamic rendering —
Module 2 v1 is intentionally static-prerendered to avoid this cost. Accept
the dynamic trade-off only when OG ships.

### Accessibility pass
**Priority:** P2
**Added:** 2026-04-13

Keyboard nav, axe-core run, VoiceOver sweep. Dim-header semantic tags. Focus
indicators on every interactive. ARIA live regions for value changes when the
year slider moves.

## Completed

_(Nothing yet. Things move here when they ship.)_
