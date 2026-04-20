/**
 * Citation URL host allowlist for Enriched.
 *
 * Every citation URL in data-src/*.ts must have its hostname in this set.
 * The build-time validator (scripts/validate-data.ts) enforces this.
 *
 * This is intentionally an ALLOWLIST, not a blocklist. Unknown domains are
 * rejected until explicitly approved. Adding a new host is a one-line PR.
 * This matches the CLAUDE.md security posture: if in doubt, reject.
 *
 * Categories:
 *   - International agencies (IAEA, NEA/OECD)
 *   - US regulators (NRC)
 *   - US DOE + national labs (energy.gov, ornl.gov, inl.gov, etc.)
 *   - US EIA (eia.gov)
 *   - Academic repositories + publishers
 *   - Industry associations (World Nuclear Association, ANS)
 *   - Reactor developer companies (added as each design is tagged)
 */

export const CITATION_ALLOWLIST: ReadonlySet<string> = new Set([
  // ─── International agencies ───────────────────────────────────────
  "iaea.org",
  "www.iaea.org",
  "oecd-nea.org",
  "www.oecd-nea.org",

  // ─── US regulators ────────────────────────────────────────────────
  "nrc.gov",
  "www.nrc.gov",

  // ─── US DOE + national labs ───────────────────────────────────────
  "energy.gov",
  "www.energy.gov",
  "ornl.gov",
  "www.ornl.gov",
  "inl.gov",
  "www.inl.gov",
  "anl.gov",
  "www.anl.gov",
  "pnnl.gov",
  "www.pnnl.gov",
  "llnl.gov",
  "www.llnl.gov",
  "sandia.gov",
  "www.sandia.gov",
  "osti.gov",
  "www.osti.gov",

  // ─── US EIA ───────────────────────────────────────────────────────
  "eia.gov",
  "www.eia.gov",

  // ─── Academic repositories + publishers ───────────────────────────
  "arxiv.org",
  "nature.com",
  "www.nature.com",
  "sciencedirect.com",
  "www.sciencedirect.com",
  "springer.com",
  "link.springer.com",
  "doi.org",
  "journals.sagepub.com",
  "onlinelibrary.wiley.com",

  // ─── Industry associations ────────────────────────────────────────
  "world-nuclear.org",
  "www.world-nuclear.org",
  "ans.org",
  "www.ans.org",
  "nei.org",
  "www.nei.org",

  // ─── US government agencies ─────────────────────────────────────────
  "nasa.gov",
  "www.nasa.gov",

  // ─── Other trusted public sources ─────────────────────────────────
  "lazard.com",
  "www.lazard.com",
  "ipcc.ch",
  "www.ipcc.ch",
  "ourworldindata.org",
  "brookings.edu",
  "www.brookings.edu",
  "congress.gov",
  "www.congress.gov",
  "gao.gov",
  "www.gao.gov",

  // ─── Reactor developer companies (public materials only) ──────────
  // Added as each design is tagged in data-src/reactors.ts.
  "westinghousenuclear.com",
  "www.westinghousenuclear.com",
  "nuscalepower.com",
  "www.nuscalepower.com",
  "x-energy.com",
  "www.x-energy.com",
  "ge.com",
  "www.ge.com",
  "gevernova.com",
  "www.gevernova.com",
  "terrapower.com",
  "www.terrapower.com",
  "kairospower.com",
  "www.kairospower.com",
  "copenhagenatomics.com",
  "www.copenhagenatomics.com",
]);

/**
 * Check if a citation URL's host is in the allowlist.
 * Strips "www." prefix for comparison if the bare domain is listed.
 */
export function isAllowedCitationHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (CITATION_ALLOWLIST.has(host)) return true;
    // Try stripping www. prefix
    if (host.startsWith("www.")) {
      return CITATION_ALLOWLIST.has(host.slice(4));
    }
    // Try adding www. prefix
    return CITATION_ALLOWLIST.has(`www.${host}`);
  } catch {
    return false;
  }
}
