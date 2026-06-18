"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Nav — top-level site navigation.
 *
 * Added as part of Module 2 Block 4 (Reactor Builder). Before this
 * component existed, Enriched was a single-page app at `/compare`.
 * Module 2 adds `/reactor-builder` and the nav makes both routes
 * discoverable.
 *
 * Spec (from Module 2 design doc, eng + design reviews):
 *   - Two text links only (Compare + Reactor Builder). No hamburger.
 *   - Spline Sans Mono 13px / 500 for inactive links.
 *   - Current page: accent color + weight 600, no underline.
 *   - Hairline rule below (1px solid --color-rule-strong).
 *   - No icons. No brand logo yet.
 *   - Padding: --spacing-3 vertical, --spacing-6 horizontal.
 *
 * Client component because usePathname() is a client-only hook.
 * Layout can still render as a server component; this component renders
 * client-side within the otherwise server-rendered tree.
 */

interface NavLink {
  href: string;
  label: string;
}

// Module 2 (Reactor Builder) is shelved pending the Module 3 (reference
// library) pivot — see docs/MODULE_2_SHELVED.md. The route stays live
// for anyone with the URL, but isn't discoverable from the nav. To
// re-enable, add: `{ href: "/reactor-builder", label: "Reactor Builder" }`.
//
// Reference deep-links to the first article in curriculum order. When a
// real /reference index page lands (article 3+), switch this to "/reference".
const LINKS: readonly NavLink[] = [
  { href: "/compare", label: "Compare" },
  { href: "/reference/fission", label: "Reference" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="relative z-[2] border-b border-[var(--color-rule-strong)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] flex items-baseline gap-[var(--spacing-6)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] py-[var(--spacing-3)]">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-semibold tracking-[-0.02em] text-[var(--color-text)] no-underline hover:opacity-80 transition-opacity"
        >
          Enriched<span className="text-[var(--color-accent)]">.</span>
        </Link>
        <ul className="flex items-baseline gap-[var(--spacing-6)] ml-auto list-none m-0 p-0">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-[family-name:var(--font-display)] text-[length:var(--text-sm)] no-underline transition-colors duration-[var(--duration-fast)] ${
                    isActive
                      ? "font-semibold text-[var(--color-accent)]"
                      : "font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
