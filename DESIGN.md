# Design System — Enriched

> Always read this file before making any visual or UI decision. Every font, color, spacing value, and aesthetic choice is defined here. Do not deviate without explicit user approval.

## Product Context

- **What this is:** Open-source, interactive nuclear energy education platform. Beautiful, neutral, data-first. Persuasion through design, not advocacy.
- **Who it's for:** Curious smart generalists first (Stratechery / Our World in Data readers), then potential investors/LPs evaluating nuclear, then nuclear Twitter / energy community.
- **Space:** Energy education, science communication, civic data viz. Adjacent to Our World in Data, Pudding, Observable, Stripe documentation.
- **Project type:** Interactive web application (Next.js 16, App Router, Tailwind CSS, Recharts, Vercel). Heavy client-side state for module interactivity. Static JSON files for data.

## Aesthetic Direction

- **Direction:** Editorial-Technical
- **Decoration level:** Intentional (hairline rules, subtle paper grain, no decorative shapes)
- **Mood:** Reads like a research paper that someone made beautiful. Confident, technical, unapologetic. Not approachable in a marketing sense — accessible because it respects the reader's intelligence.
- **Reference sites:** Observable (typography), Pudding (editorial confidence), Vercel (restraint), Our World in Data (the gap to fill — great data, mediocre chrome).
- **Anti-references:** No purple gradients. No icons in colored circles. No decorative blobs. No "approachable" rounded everything. No corporate blue. No environmentalist green.

### Three deliberate creative risks

1. **Monospace display font for headers and key numbers.** Spline Sans Mono signals "real data, you're smart enough to read it." Departs from the category default of humanist sans-serif.
2. **Rust/cinnabar accent (#D04A1F).** Not blue (corporate), not green (environmentalist), not red (warning). Energy-coded. Looks like fire, oxidized metal, the inside of a reactor.
3. **No icons. Anywhere.** Visual vocabulary is words and numbers, presented beautifully. Pulls weight on typography rather than iconography.

## Typography

All fonts are loaded from Google Fonts (free, open-source).

- **Display / Hero:** Spline Sans Mono — `400 / 500 / 600 / 700` weights. Used for: page titles, section headers, navigation, eyebrow labels, key numbers, brand mark. Tight tracking (`-0.02em` to `-0.025em` at large sizes). The signature voice of the site.
- **Body:** Instrument Sans — `400 / 500 / 600` weights. Used for: paragraphs, descriptions, methodology, captions. Excellent legibility, geometric humanist character, not overused.
- **Data / Tabular:** JetBrains Mono — `400 / 500 / 600` weights. Used for: bar chart values, citations, BibTeX preview, API/data documentation, table cells. **Always use `font-variant-numeric: tabular-nums`** so columns align at the decimal.
- **System fallback:** Spline Sans Mono → `SFMono-Regular, Menlo, Consolas, monospace`. Instrument Sans → `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`. JetBrains Mono → same as Spline Sans Mono fallback.

### Font blacklist (NEVER use)

Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Satoshi, Geist (avoid for brand separation from Vercel), Comic Sans, Papyrus.

### Loading strategy

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Spline+Sans+Mono:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Three fonts is the maximum. Every additional font is a render-blocking request.

### Type scale (rem-based, 16px root)

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | `11px / 0.6875rem` | Eyebrows, micro-labels (always uppercase, `letter-spacing: 0.1em`) |
| `--text-sm` | `13px / 0.8125rem` | Captions, table headers, nav links |
| `--text-base` | `16px / 1rem` | Body text |
| `--text-lg` | `19px / 1.1875rem` | Lead paragraphs, page subtitles |
| `--text-xl` | `22px / 1.375rem` | Highlighted values, year slider |
| `--text-2xl` | `32px / 2rem` | Section titles |
| `--text-3xl` | `48px / 3rem` | Sub-display |
| `--text-4xl` | `56px / 3.5rem` | Page titles |
| `--text-hero` | `72px / 4.5rem` | Landing hero only |

Line height: `1.05` for display sizes, `1.15` for sub-display, `1.5-1.6` for body.

## Color

**Approach:** Restrained. Warm-neutral grayscale with a single saturated accent. Color is rare and meaningful. When color appears, it carries information.

### Light mode (default and primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#FAF9F6` | Page background. Warm off-white with subtle paper grain overlay (SVG noise at 4% opacity). |
| `--surface` | `#FFFFFF` | Card backgrounds, raised surfaces |
| `--text` | `#1A1A1A` | Primary text, primary data bars |
| `--text-muted` | `#6B6B6B` | Secondary text, descriptions |
| `--text-faint` | `#9A9591` | Tertiary text, micro-labels, axis ticks |
| `--rule` | `#E8E5DE` | Hairline borders, dividers (warm gray, NOT blue gray) |
| `--rule-strong` | `#D8D4CC` | Stronger borders, table headers |
| `--accent` | `#D04A1F` | Brand accent. Used sparingly: brand period, active nav, year slider value, normalized multiples, cite-button hover, section number labels |
| `--accent-soft` | `#F4E4DD` | Accent backgrounds, banners, badges |

### Data series colors (for charts)

| Token | Hex | Usage |
|-------|-----|-------|
| `--data-1` | `#1A1A1A` | Primary series (usually nuclear when shown) |
| `--data-2` | `#B8B4AF` | Secondary series |
| `--data-3` | `#8C8580` | Tertiary series |

**Accessibility rule:** Bars MUST be differentiated by pattern/texture in addition to shade, not by color alone. Use SVG `<pattern>` fills (diagonal stripes, dots) for series 2+ to support color-blind users.

### Dark mode

Dark mode is **not in Ship 1**. The design doc explicitly says "warm off-white, not dark mode." If dark mode is added later, it should not be a simple color inversion — surfaces, accent saturation, and grain need to be redesigned for the dark context.

### Semantic colors

Avoid traditional semantic palettes (success green, warning yellow, error red). The "data does the talking" principle means the data already conveys its own valence. If genuinely needed for system feedback (form errors, etc.):

- `--info` `#3D6BB8` — neutral blue for informational notices
- `--warning` `#D9A23B` — amber, only for genuine warnings
- `--error` `#B83D3D` — red, only for genuine errors

These are NOT the brand accent. The brand accent is rust. Reserve semantic colors for system messaging only.

## Spacing

**Base unit:** 4px. **Density:** comfortable (between Vercel's tightness and Pudding's looseness).

| Token | px | Usage |
|-------|----|----|
| `--space-1` | 4 | Micro gaps, inline spacing |
| `--space-2` | 8 | Tight gaps, pill padding |
| `--space-3` | 12 | Small gaps, label-to-value spacing |
| `--space-4` | 16 | Standard padding, gap between related elements |
| `--space-6` | 24 | Section padding, gap between unrelated elements |
| `--space-8` | 32 | Card padding, larger gaps |
| `--space-12` | 48 | Section header bottom margin, between major sections within a page |
| `--space-16` | 64 | Hero padding, large vertical rhythm |
| `--space-24` | 96 | Between top-level page sections |
| `--space-32` | 128 | Maximum vertical rhythm |

**Vertical rhythm rule:** content always breathes. If a section feels cramped, it is cramped — increase the surrounding space rather than reducing the content.

## Layout

- **Approach:** Hybrid. Grid-disciplined for data sections (charts, tables, comparisons must align precisely). Editorial freedom for narrative sections (landing, about, methodology).
- **Container:** `max-width: 1200px`, centered, horizontal padding `var(--space-6)` minimum.
- **Grid:** 12-column grid for data sections. Asymmetric two-column for section headers (1fr title + 2fr description, or vice versa).
- **Border radius scale:**
  - `--radius-sm` `3px` — buttons, inputs, citation blocks
  - `--radius-md` `4px` — cards, surfaces, the year slider container
  - `--radius-pill` `100px` — toggleable pills only
  - `--radius-full` `9999px` — circles only (slider handle, brand marks)
- **No huge border radii.** No bubbly corners. The site is precise, not soft.

## Motion

**Approach:** Intentional. Motion supports comprehension and delight, never distracts.

| Property | Value | Usage |
|----------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default for entrances, hover states |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Continuous transitions |
| `--duration-fast` | `100ms` | Hover states, pill toggles, tooltips |
| `--duration-base` | `150ms` | Button feedback |
| `--duration-medium` | `250ms` | Bar chart transitions, year-driven changes |
| `--duration-slow` | `400ms` | Reserved for entrance animations, used sparingly |

**Page transitions:** none. Instant feels more technical than animated.

**Real-time interactions** (year slider drag): no easing. Bars track the slider 1:1. Easing during drag feels laggy.

**Reduced motion:** Respect `prefers-reduced-motion: reduce`. All transitions become instant. Final states are shown without animation.

## Iconography

**There are no decorative icons.** This is a deliberate constraint.

When functional iconography is needed (rare):

- **Cite this:** the literal characters `{}` in monospace, not an icon
- **External link indicator:** the literal character `↗` in body type
- **Loading state:** a thin spinning ring (not an icon, a CSS-only element)
- **Error states:** the literal characters `!` or `×` in display type
- **Section markers:** `//` and `/` as visual punctuation in monospace eyebrow text

Brand mark uses a literal period (`.`) in the rust accent color: `Enriched.`

If we ever need true iconography (e.g., social media share buttons), use Lucide icons (open-source, monoline, geometric) and keep them at body text size with `currentColor`. Never use filled icons. Never use colored icons.

## Component Patterns

These are documented as conventions, not as a UI library. Each module builds them fresh using the tokens above.

### Pills (toggleable source selectors)
- Border: `1.5px solid var(--rule-strong)`, `100px` radius
- Padding: `var(--space-2) var(--space-4)`
- Font: Spline Sans Mono `13px / 500`
- States: default (border + muted text), hover (border darkens), active (filled black, light text), active-secondary (filled rule, dark text — used for the currently-second comparison source)

### Buttons
- Primary: `--text` background, `--bg` text, hovers to `--accent` background. Padding `var(--space-3) var(--space-6)`. Spline Sans Mono `13px / 500`. Radius `--radius-sm`.
- Secondary: `--surface` background, `--text` text, `1.5px solid --rule-strong` border, hovers to `--text` border.
- Ghost: transparent, muted text, hovers to `--text`.

### Cards
- Background: `--surface`
- Border: `1px solid --rule`
- Radius: `--radius-md` (4px)
- Padding: `var(--space-6)` to `var(--space-8)`
- No box shadows. Hairline borders only.

### Bar charts (the signature data viz)
- Row layout: grid `[source-label] [bar-track] [value] [cite-btn]`
- Bar height: `22px`
- Bar fill: `--data-1` for primary series, `--data-2` for secondary, with SVG pattern overlay for color-blind support
- Animated bar transitions: `width 250ms var(--ease-out)`
- Value displayed in JetBrains Mono with tabular-nums
- Normalized multiples (when normalize is active) appear next to value in `--accent`, weight 600, format `45×`

### Year slider
- Track height `4px`, `--rule` background, `--text` filled portion
- Handle: `16px` circle, `--accent` fill, `2px solid --bg` border, soft shadow
- Year value displayed above in Spline Sans Mono `22px / 600 / --accent`

### Citation block
- Container: `--surface` background, `--rule` border, `--radius-md`
- Content: JetBrains Mono `12px`, line height `1.7`, `--text` color
- Inner code surface: `--bg` background, `--rule` border
- Format toggle buttons below: `--font-display` `12px`, ghost-style with active state

## Accessibility

- **Target:** WCAG 2.1 AA minimum
- **Contrast:** All text combinations must meet 4.5:1 (verified: `#1A1A1A` on `#FAF9F6` = 16.5:1, `#6B6B6B` on `#FAF9F6` = 5.4:1, `#D04A1F` on `#FAF9F6` = 4.6:1)
- **Color independence:** Bar charts use both color/shade AND pattern/texture. Never rely on color alone.
- **Keyboard navigation:** Tab order follows visual reading order. Pills are focusable and toggleable with Space/Enter. Arrow keys navigate within pill groups. Year slider responds to arrow keys and Page Up/Down.
- **Screen readers:** Every chart row has an `aria-label` describing source + dimension + value (e.g., "Nuclear capacity factor: 92.5 percent"). Chart sections include a screen-reader-only summary describing the comparison in words.
- **Reduced motion:** All transitions disabled when `prefers-reduced-motion: reduce` is set. Final states shown immediately.
- **Focus indicators:** `2px solid --accent` outline with `2px` offset. Never `outline: none` without a replacement.

## CSS Custom Property Reference (copy-paste into globals.css)

```css
:root {
  /* Color */
  --bg: #FAF9F6;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-muted: #6B6B6B;
  --text-faint: #9A9591;
  --rule: #E8E5DE;
  --rule-strong: #D8D4CC;
  --accent: #D04A1F;
  --accent-soft: #F4E4DD;
  --data-1: #1A1A1A;
  --data-2: #B8B4AF;
  --data-3: #8C8580;
  --info: #3D6BB8;
  --warning: #D9A23B;
  --error: #B83D3D;

  /* Typography */
  --font-display: "Spline Sans Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --font-body: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", SFMono-Regular, Menlo, Consolas, monospace;

  --text-xs: 0.6875rem;   /* 11 */
  --text-sm: 0.8125rem;   /* 13 */
  --text-base: 1rem;      /* 16 */
  --text-lg: 1.1875rem;   /* 19 */
  --text-xl: 1.375rem;    /* 22 */
  --text-2xl: 2rem;       /* 32 */
  --text-3xl: 3rem;       /* 48 */
  --text-4xl: 3.5rem;     /* 56 */
  --text-hero: 4.5rem;    /* 72 */

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;

  /* Layout */
  --radius-sm: 3px;
  --radius-md: 4px;
  --radius-pill: 100px;
  --radius-full: 9999px;
  --container-max: 1200px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 100ms;
  --duration-base: 150ms;
  --duration-medium: 250ms;
  --duration-slow: 400ms;
}
```

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-09 | Initial design system created via /design-consultation | Editorial-Technical aesthetic established. Three deliberate risks: monospace display (Spline Sans Mono), rust accent (#D04A1F), no icons. Visual research from Observable, Stripe, OWID, Linear, Vercel, Pudding informed the synthesis. EUREKA: monospace display font signals "real data" the way no humanist sans-serif can. |
