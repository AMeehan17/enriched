# Module 2 (Reactor Builder) — Shelved

**Status:** shelved 2026-04-21. Code is live at `/reactor-builder` for anyone
with the URL but is removed from the site nav. Last active work was the
schema v4 milestone (commit `35e8772`): neutron spectrum step, bidirectional
physics coupling with the Thorium thermal-breeder exception, and step-level
`(?)` "why this decision matters" explainers.

## Why it's shelved

The Reactor Builder is a constraint-satisfaction tool: user picks chips,
tool narrows the match list. That shape is great for practitioners who
already know the terrain and want to enumerate. It's a poor shape for
teaching — which is Enriched's whole mission.

Two user segments, both poorly served by the current tool:

- **Curious outsiders** ("I want to learn about advanced reactors")
  don't come away with understanding. They see *which* designs exist,
  not *why* to care about one vs another. The tag popovers explain
  individual chips; the step explainers explain individual steps; but
  the user's own selections stay narratively mute. Nothing tells them
  "here's what this choice commits you to, here's what it rules out,
  here's what reactor family you're in."
- **Practitioners / NPV colleagues** already have more powerful tools.
  A public chip builder isn't what they'd reach for.

The honest conclusion: for Enriched's teaching mission, the module as
currently shaped doesn't carry its weight, and iterating on it
indefinitely to get there isn't a better bet than redirecting effort
to Module 3 (the reference library of deep-dive articles).

## What's preserved

The v4 milestone commit is a clean, usable artifact:

- Schema v4 JSON at `public/data/taxonomy.json` and `public/data/reactors.json`
  (breaking change from v3 — `schemaVersion: 4`).
- Full bidirectional physics coupling in `ReactorBuilderView.tsx`, with
  the Thorium thermal-breeder exception explicit in the locking rules.
- Citation-backed step explainers in `data-src/reactor-taxonomy.ts` under
  `stepExplainers` (one per step, each with ≥1 primary-source citation).
- 41 passing tests in `lib/reactor-match.test.ts`, including the
  U-235-thermal-breeder-is-impossible and Th-232-thermal-breeder-works
  cases that surface the physics.
- Validator in `scripts/validate-data.ts` enforces schema v4 correctness,
  spectrum coverage, and stepExplainer key uniqueness + coverage.

None of this is wasted work. If Module 2 is ever revived — most likely
as an *appendix* to Module 3 articles, where articles link into specific
builder states via URL params — the data model and coupling engine are
solid.

## Reviving it later

If the decision is to bring it back:

1. Re-add the nav link in `app/_components/Nav.tsx` (there's a comment
   above the `LINKS` array with the exact line to restore).
2. Decide the product question *before* re-linking: is the builder now
   a reference appendix to Module 3 articles (solid), or trying to
   teach on its own (dangerous — that's what got it shelved).
3. If it's the second, the gap that kept users from learning was
   **decisions → consequences**, not decisions → matches. The user's
   own selections need to narrate what they imply and what they rule
   out, not just filter the match list.

## Where effort goes next

Module 1 (`/compare`) stays the public front door. Module 3 (reference
library) is the next build — real articles on thermal vs fast spectrum,
the thorium fuel cycle, sodium's sins and virtues, waste, regulation.
Articles are how curious outsiders actually learn, and they're what
Enriched's mission points at.
