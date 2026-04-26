# Enriched

Interactive, open-source nuclear energy education platform. Data does the talking.

## Scope — what Enriched is (and is not)

Enriched is a **technical and educational tool** about how nuclear reactors work. It teaches what it takes to build a reactor: the physics, the design choices (fuel, coolant, moderator, spectrum, scale, safety features), the techno-economic trade-offs, the regulatory landscape. Every claim is cited to independently verifiable primary sources — IAEA, NRC, DOE, EIA, SEC filings, peer-reviewed papers, company press releases.

The product arc is roughly:

- **Module 1 — Energy Source Comparison** (shipped). Compare energy sources across eight dimensions.
- **Module 2 — Reactor Builder** (shelved 2026-04-21, see `docs/MODULE_2_SHELVED.md`). Schema v4 is live at `/reactor-builder` but is de-linked from the top nav. A chip-picking constraint-satisfier doesn't teach the way a curious outsider needs; Module 3 articles are the better shape for that work. Do not iterate on the Reactor Builder without re-reading the shelving doc and re-asking the product question first.
- **Module 3 — Reference Library** (next). Deep-dive articles on reactor science, fuel cycles, safety physics, waste, regulation, history. The teaching layer Module 2 couldn't be. Articles can later cite the Reactor Builder as an interactive appendix.

**Enriched does NOT cover:**

- Business landscape, company underwriting, fund-style analyst judgments, or "who is serious / who is not" opinions. That is NPV's proprietary domain and lives in a separate private tool.
- Subjective Low / Med / High confidence scores or any NPV-internal annotations.
- Quotes, summaries, or reproductions of paywalled or proprietary research (Pitchbook, subscription analyst reports, internal decks).

The split is deliberate. Enriched is the public physics / engineering textbook. NPV's company-underwriting tool will consume Enriched as its foundation (cite its cells, embed its data model) and add proprietary business analysis on top — but that analysis never lives in this repo.

## Security boundary — non-negotiable

This repo is **public** on GitHub at [`github.com/AMeehan17/enriched`](https://github.com/AMeehan17/enriched) and lives at `~/Desktop/AndrewsProjects/Enriched/`. NPV-confidential content — fund documents, LP communications, deal flow, legal agreements, portfolio company materials, proprietary research, board content — lives separately at `~/Documents/Neutron Power Ventures/`. The two trees were intentionally separated on 2026-04-21 so that parent-directory traversal can no longer reach NPV content. The rules below are still load-bearing because both trees coexist on the same machine and the agent can read either one.

**Rules the agent must follow without exception:**

1. **Never copy files from the NPV tree (or any other external location) into this repo.** External content is off-limits for committing, staging, or writing into any file that could be committed — including `data-src/drafts/`, `docs/`, and root-level markdown. The `Lazard Reports/` and `reference/` folders inside Enriched are already untracked via `.gitignore` + `.vercelignore`; they are the only exception, and even their contents must not be quoted into committed files.
2. **Never reference absolute paths that leak the NPV directory structure.** You may READ files under `~/Documents/Neutron Power Ventures/` for research context, but output (summaries, citation catalogs, notes, TODOs) must use only public identifiers — publisher + title + year + URL — never local paths like `/Users/andrew/Documents/Neutron Power Ventures/Company Assets/...`.
3. **Never quote or summarize NPV-internal content into committed files.** Board materials, fund reports, LP communications, deal memos, internal spreadsheets with subjective scores, unpublished NPV decks, portfolio company confidential materials — none of this appears in any Enriched file, even in `drafts/`, even as paraphrase.
4. **Proprietary research is research-only.** Pitchbook, analyst subscriptions, MacroVoices paid content, internal research: you may READ them to inform what Enriched says, but every citation on the public site must target the independently verifiable primary source the proprietary report itself references. If you find a stat in a Pitchbook report, find the underlying SEC filing / DOE announcement / company press release / academic paper and cite that.
5. **Only stage paths inside the Enriched repo root.** `git add -A` from inside Enriched is safe; `git add` with any path outside the repo is a critical violation. The NPV tree no longer sits above this repo, but it (and everything else on the machine) still has zero git protection — `.gitignore` only covers what's inside the repo.
6. **If in doubt, ask.** The test is: *"If this file shipped to GitHub tomorrow, would anything be compromised?"* If the answer is not clearly no, the artifact does not exist in this repo.

Treat the NPV tree as a read-only reference library — useful for understanding what the user is working on, but one-way insulation between that context and anything committed to Enriched.

## Design System

Always read `DESIGN.md` before making any visual or UI decision. All font choices, colors, spacing values, and aesthetic direction are defined there. Do not deviate without explicit user approval. In QA mode, flag any code that doesn't match `DESIGN.md`.

Key principles enforced by DESIGN.md:
- **No icons.** The visual vocabulary is words and numbers. Use literal characters (`{}`, `↗`, `//`) instead of icon components.
- **Three fonts only:** Spline Sans Mono (display), Instrument Sans (body), JetBrains Mono (data). Never Inter, Roboto, Arial, Geist, or Satoshi.
- **One accent color:** rust `#D04A1F`. Use sparingly, always with meaning.
- **Hairline rules, never shadows.** Cards use `1px solid var(--rule)`, not `box-shadow`.
- **Tabular nums on every number.** `font-variant-numeric: tabular-nums` is required for any rendered numeric value.
- **No bubbly corners.** Border radius scale tops out at `4px` for cards. Pills are `100px` (the only exception).
- **Persuasion through design.** Every choice passes the test: "Does this let the data talk, or are we talking?"

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
