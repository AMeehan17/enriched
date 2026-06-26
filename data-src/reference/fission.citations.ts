/**
 * Seed citations for the fission reference article (Module 3, article 1).
 *
 * Order matters: array position determines the footnote number <Cite>
 * renders. Author orders the array to match prose citation order.
 *
 * SEED FILE — every URL below is the publisher root or a plausible deep
 * link. Verify each one points to the exact document before article 1
 * ships. The build-time host-allowlist check accepts any URL under
 * iaea.org, nrc.gov, energy.gov, osti.gov, onlinelibrary.wiley.com,
 * doi.org — those are the hosts referenced here.
 *
 * Several sources overlap with spectrum.citations.ts (same DOE handbook,
 * same Stacey textbook). Bibtex keys are suffixed `_fission` here vs
 * `_spectrum` there so the global uniqueness check stays happy; the
 * underlying source is the same, the per-article citation is its own
 * entity for indexing purposes.
 */

import type { Citation } from "../../lib/data-types";

export const citations: ReadonlyArray<Citation> = [
  {
    bibtex_key: "knoll2010radiation_fission",
    author: "Knoll, G. F.",
    title: "Radiation Detection and Measurement",
    year: 2010,
    version: "4th edition",
    publisher: "Wiley",
    // TODO(url): confirm Wiley product page for 4th edition.
    url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470909553",
    accessed: "2026-06-18",
    note: "Chapter 1 covers neutron sources including Am-Be (α,n) reaction yields and the practical reactor-startup use case.",
  },
  {
    bibtex_key: "stacey2007physics_fission",
    author: "Stacey, W. M.",
    title: "Nuclear Reactor Physics",
    year: 2007,
    version: "2nd edition",
    publisher: "Wiley-VCH",
    // TODO(url): confirm exact DOI / Wiley product page for the 2nd edition.
    url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9783527611041",
    accessed: "2026-06-18",
    note: "Chapter 1 derives the multiplication factor k and the four-factor formula; chapter 3 introduces the ν-bar distribution for prompt fission neutrons.",
  },
  {
    bibtex_key: "doe1993handbook_fission",
    author: "U.S. Department of Energy",
    title: "Nuclear Physics and Reactor Theory, DOE-HDBK-1019/1-93, Volume 1",
    year: 1993,
    publisher: "U.S. Department of Energy",
    // TODO(url): confirm OSTI biblio ID and replace with stable OSTI link.
    url: "https://www.osti.gov/biblio/10169603",
    accessed: "2026-06-18",
    note: "Public-domain DOE Fundamentals Handbook. Module 2 introduces fission and the four-factor formula at the level our reader needs.",
  },
  {
    bibtex_key: "nrc_reactor_concepts_fission",
    author: "U.S. Nuclear Regulatory Commission",
    title: "Reactor Concepts Manual — Reactor Physics",
    year: 2024,
    publisher: "USNRC Technical Training Center",
    // TODO(url): verify NRC has not moved this URL.
    url: "https://www.nrc.gov/reading-rm/basic-ref/teachers/reactor-concepts-manual.html",
    accessed: "2026-06-18",
    note: "NRC public training material; chapters 2–3 walk through the chain reaction and the multiplication factor k in operator-facing language.",
  },
  {
    bibtex_key: "iaea2005rrtechniques_fission",
    author: "International Atomic Energy Agency",
    title: "Operational Limits and Conditions and Operating Procedures for Research Reactors",
    year: 2008,
    publisher: "IAEA Safety Standards Series No. NS-G-4.4",
    // TODO(url): confirm publication slug on iaea.org.
    url: "https://www.iaea.org/publications/7895/operational-limits-and-conditions-and-operating-procedures-for-research-reactors",
    accessed: "2026-06-18",
    note: "Reference for startup-source neutron monitoring requirements in research reactors — the operational reason the seed source exists.",
  },
];
