# Enriched

Interactive, open-source nuclear energy education platform. Data does the talking.

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
