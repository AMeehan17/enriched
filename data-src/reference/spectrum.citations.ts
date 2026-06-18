/**
 * Seed citations for the spectrum reference article (Module 3, article 1).
 *
 * Order matters: the position in this array determines the footnote number
 * <Cite> renders in the article. Author orders the array to match the order
 * in which they expect to cite each source in the prose.
 *
 * SEED FILE — every URL below is the publisher root or a plausible deep link.
 * Verify each one points to the exact document before article 1 ships.
 * The build-time host-allowlist check (lib/citation-allowlist.ts) will accept
 * any URL under iaea.org, nrc.gov, energy.gov, osti.gov, oecd-nea.org, or
 * onlinelibrary.wiley.com — those are the hosts referenced here.
 */

import type { Citation } from "../../lib/data-types";

export const citations: ReadonlyArray<Citation> = [
  {
    bibtex_key: "stacey2007physics_spectrum",
    author: "Stacey, W. M.",
    title: "Nuclear Reactor Physics",
    year: 2007,
    version: "2nd edition",
    publisher: "Wiley-VCH",
    // TODO(url): confirm exact DOI / Wiley product page for the 2nd edition.
    url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9783527611041",
    accessed: "2026-06-16",
    note: "Standard graduate-level text on reactor physics; chapters 2 and 14 cover thermal-vs-fast spectrum behavior.",
  },
  {
    bibtex_key: "doe1993handbook_spectrum",
    author: "U.S. Department of Energy",
    title: "Nuclear Physics and Reactor Theory, DOE-HDBK-1019/1-93, Volume 1",
    year: 1993,
    publisher: "U.S. Department of Energy",
    // TODO(url): confirm OSTI biblio ID and replace with stable OSTI link.
    url: "https://www.osti.gov/biblio/10169603",
    accessed: "2026-06-16",
    note: "Public-domain DOE Fundamentals Handbook. Volume 1 chapters 1–4 introduce neutron interactions, cross-sections, and the moderation cycle.",
  },
  {
    bibtex_key: "nrc_reactor_concepts_spectrum",
    author: "U.S. Nuclear Regulatory Commission",
    title: "Reactor Concepts Manual",
    year: 2024,
    publisher: "USNRC Technical Training Center",
    // TODO(url): verify NRC has not moved this URL.
    url: "https://www.nrc.gov/reading-rm/basic-ref/teachers/reactor-concepts-manual.html",
    accessed: "2026-06-16",
    note: "NRC public training material; section on reactor types covers thermal vs fast spectrum at the level our reader needs.",
  },
  {
    bibtex_key: "iaea2012fr12_spectrum",
    author: "International Atomic Energy Agency",
    title: "Fast Reactors and Related Fuel Cycles: Safe Technologies and Sustainable Scenarios (FR12)",
    year: 2012,
    publisher: "IAEA Proceedings Series",
    // TODO(url): confirm publication page on iaea.org.
    url: "https://www.iaea.org/publications/8704/fast-reactors-and-related-fuel-cycles-safe-technologies-and-sustainable-scenarios-fr12",
    accessed: "2026-06-16",
    note: "Conference proceedings; useful for the breeder-reactor framing in the article's second half.",
  },
  {
    bibtex_key: "oecdnea2014gen4roadmap_spectrum",
    author: "OECD Nuclear Energy Agency",
    title: "Technology Roadmap Update for Generation IV Nuclear Energy Systems",
    year: 2014,
    publisher: "OECD/NEA",
    // TODO(url): confirm exact NEA publication slug.
    url: "https://www.oecd-nea.org/jcms/pl_30269/technology-roadmap-update-for-generation-iv-nuclear-energy-systems",
    accessed: "2026-06-16",
    note: "Reference for why fast-spectrum designs dominate the Gen-IV reactor families.",
  },
];
