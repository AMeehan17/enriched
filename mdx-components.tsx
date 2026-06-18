/**
 * Global MDX component registry.
 *
 * Next.js auto-discovers this file at the repo root when @next/mdx is set up.
 * Any component returned from useMDXComponents() is available in every MDX
 * file without import.
 *
 * Registered:
 *   - Cite, Bibliography — citation system (see lib/cells/citations-context).
 *   - MaxwellBoltzmannSlider, CrossSectionPlot, FuelUtilizationChart —
 *     placeholders for Module 3 article 1 cells. Each renders a hairline
 *     "coming soon" card so the prose-only checkpoint is shippable at
 *     ~week 1.5 even if cell builds slip.
 *
 * Typography overrides for h1/h2/h3/p/code/a use DESIGN.md tokens directly
 * via CSS variables. No icons. Tabular nums on every number.
 */

import type { MDXComponents } from "mdx/types";
import { Cite } from "./lib/cells/Cite";
import { Bibliography } from "./lib/cells/Bibliography";
import { CellPlaceholder } from "./lib/cells/CellPlaceholder";
import { MaxwellBoltzmannSlider } from "./lib/cells/MaxwellBoltzmannSlider";
import { ChainReactionViz } from "./lib/cells/ChainReactionViz";
import { FissionAnimation } from "./lib/cells/FissionAnimation";
import { ArticleLink } from "./lib/cells/ArticleLink";

const mdxComponents: MDXComponents = {
  // Citation system + article cross-links — available globally in every MDX file.
  Cite,
  Bibliography,
  ArticleLink,

  // Module 3 cells — real components for shipping cells; placeholders for
  // cells that haven't landed yet. Both compose into MDX without an import.
  MaxwellBoltzmannSlider,
  ChainReactionViz,
  FissionAnimation,
  NuDistributionChart: () => (
    <CellPlaceholder
      title="ν probability distribution — U-235 thermal fission"
      note="Shows the discrete probabilities of releasing 0, 1, 2, ... neutrons per fission. Coming next."
    />
  ),
  CrossSectionPlot: () => (
    <CellPlaceholder
      title="Cross-section log-log plot"
      note="Reuses Module 1 chart primitives (P3 audit verified 2026-06-16)."
    />
  ),
  FuelUtilizationChart: () => (
    <CellPlaceholder
      title="Fuel utilization chart"
      note="Reuses Module 1 chart primitives (P3 audit verified 2026-06-16)."
    />
  ),

  // Typography overrides — DESIGN.md tokens, no icons.
  h1: ({ children, ...props }) => (
    <h1
      {...props}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-3xl)",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        lineHeight: 1.1,
        marginBottom: "var(--spacing-8)",
        color: "var(--color-text)",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-xl)",
        fontWeight: 500,
        letterSpacing: "-0.005em",
        lineHeight: 1.2,
        marginTop: "var(--spacing-12)",
        marginBottom: "var(--spacing-4)",
        color: "var(--color-text)",
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-lg)",
        fontWeight: 500,
        lineHeight: 1.3,
        marginTop: "var(--spacing-8)",
        marginBottom: "var(--spacing-3)",
        color: "var(--color-text)",
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      {...props}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-base)",
        lineHeight: 1.65,
        marginBottom: "var(--spacing-4)",
        color: "var(--color-text)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </p>
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.875em",
        fontVariantNumeric: "tabular-nums",
        color: "var(--color-text)",
        background: "var(--color-rule)",
        padding: "0.1em 0.35em",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {children}
    </code>
  ),
  a: ({ children, href, ...props }) => (
    <a
      {...props}
      href={href}
      style={{
        color: "var(--color-text)",
        textDecoration: "underline",
        textDecorationColor: "var(--color-rule-strong)",
        textUnderlineOffset: "3px",
      }}
    >
      {children}
    </a>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...mdxComponents,
  };
}
