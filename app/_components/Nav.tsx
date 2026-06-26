"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REFERENCE_ARTICLES } from "@/data-src/reference/articles";

/**
 * Nav — top-level site navigation.
 *
 * Two top-level links: Compare + Learn. The Learn entry deep-links to
 * the first chapter in curriculum order on click; on hover or keyboard
 * focus it opens a chapter dropdown built from the articles manifest.
 *
 * The dropdown is CSS-only — Tailwind v4 `group-hover` + `group-focus-within`
 * make it visible. No useState, no JS event handlers, so SSR renders
 * the full menu structure and hydration is trivially correct.
 *
 * Mobile (no hover): tap on the Learn link still goes to the first
 * article. Subnav is just hidden until in-article navigation surfaces
 * the next chapter via <ArticleLink>.
 *
 * Module 2 (Reactor Builder) is shelved per docs/MODULE_2_SHELVED.md;
 * the route stays live but isn't discoverable from the nav.
 */

interface SubnavItem {
  href: string;
  label: string;
  dek: string;
}

interface NavLink {
  href: string;
  label: string;
  subnav?: ReadonlyArray<SubnavItem>;
  /** URL prefix that marks this link as active. Defaults to the href. */
  activeMatchPrefix?: string;
}

// The Learn subnav is derived from the Reference Library manifest so
// every published article appears in the dropdown automatically.
const LEARN_SUBNAV: ReadonlyArray<SubnavItem> = REFERENCE_ARTICLES.map((a) => ({
  href: `/reference/${a.slug}`,
  label: a.title,
  dek: a.dek,
}));

// First article in curriculum order — the click target for the Learn nav.
const LEARN_FIRST_HREF =
  LEARN_SUBNAV.length > 0
    ? LEARN_SUBNAV[0]!.href
    : "/reference";

const LINKS: readonly NavLink[] = [
  { href: "/compare", label: "Compare" },
  {
    href: LEARN_FIRST_HREF,
    label: "Learn",
    subnav: LEARN_SUBNAV,
    activeMatchPrefix: "/reference",
  },
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
            const activePrefix = link.activeMatchPrefix ?? link.href;
            const isActive =
              pathname === activePrefix ||
              pathname.startsWith(activePrefix + "/");
            return (
              <li
                key={link.label}
                className={link.subnav ? "group relative" : ""}
              >
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-haspopup={link.subnav ? "menu" : undefined}
                  className={`font-[family-name:var(--font-display)] text-[length:var(--text-sm)] no-underline transition-colors duration-[var(--duration-fast)] ${
                    isActive
                      ? "font-semibold text-[var(--color-accent)]"
                      : "font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {link.label}
                </Link>
                {link.subnav ? (
                  <div
                    role="menu"
                    aria-label={`${link.label} chapters`}
                    className="
                      hidden group-hover:block group-focus-within:block
                      absolute top-full right-0 mt-[var(--spacing-2)]
                      min-w-[280px] max-w-[360px]
                      bg-[var(--color-surface)]
                      border border-[var(--color-rule)]
                      rounded-[var(--radius-md)]
                      py-[var(--spacing-2)]
                      z-10
                    "
                  >
                    <ul className="list-none m-0 p-0 flex flex-col">
                      {link.subnav.map((item, idx) => {
                        const itemActive = pathname === item.href;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              role="menuitem"
                              aria-current={itemActive ? "page" : undefined}
                              className={`
                                block no-underline
                                px-[var(--spacing-4)] py-[var(--spacing-3)]
                                ${
                                  idx > 0
                                    ? "border-t border-[var(--color-rule)]"
                                    : ""
                                }
                                ${
                                  itemActive
                                    ? "bg-[var(--color-accent-soft)]"
                                    : "hover:bg-[var(--color-rule)]"
                                }
                                transition-colors duration-[var(--duration-fast)]
                              `}
                            >
                              <div
                                className={`font-[family-name:var(--font-display)] text-[length:var(--text-sm)] ${
                                  itemActive
                                    ? "text-[var(--color-accent-text)] font-semibold"
                                    : "text-[var(--color-text)] font-medium"
                                }`}
                              >
                                {item.label}
                              </div>
                              <div className="font-[family-name:var(--font-body)] text-[length:var(--text-xs)] text-[var(--color-text-muted)] mt-[2px] leading-snug">
                                {item.dek}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
