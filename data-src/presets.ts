import type { Preset } from "@/lib/data-types";

/**
 * PRESETS — curated comparison configurations.
 *
 * Each preset is a "rebuttal in a link" — share /compare?preset=climate-case
 * and the user lands on a comparison tuned to a specific argument. Compiled
 * to public/data/presets.json by scripts/build-data.ts.
 *
 * Ship 1 ships 5 presets. germany-vs-france is dropped — its URL schema
 * differs structurally (country-filtered, not source-filtered) and it requires
 * per-country data that ships with Module 6 (the What If? simulator).
 *
 * Each preset must reference only valid source IDs and dimension IDs. The
 * validator catches typos at build time.
 */

export const presets: ReadonlyArray<Preset> = [
  {
    slug: "climate-case",
    title: "The Climate Case for Nuclear",
    description:
      "Compare lifecycle CO2 and land use across all low-carbon sources.",
    sources: ["nuclear", "solar", "wind", "hydro"],
    normalize: "nuclear",
    year: 2024,
    highlightedDimensions: ["lifecycleCO2", "landUse", "capacityFactor"],
    rhetoricalPoint:
      "Nuclear's low-carbon credentials are underweighted in most climate conversations. Look at the numbers across CO2, land use, and how often each source actually generates power.",
  },
  {
    slug: "fear-of-nuclear",
    title: "Fear of Nuclear",
    description:
      "Deaths per terawatt-hour. Including mining, accidents, and air pollution.",
    sources: ["nuclear", "coal", "gas", "solar"],
    normalize: "none",
    year: 2024,
    highlightedDimensions: ["deathsPerTWh"],
    rhetoricalPoint:
      "Nuclear is among the safest energy sources per unit produced. Coal kills hundreds of times more people per TWh, mostly from air pollution.",
  },
  {
    slug: "baseload-vs-intermittent",
    title: "Baseload vs Intermittent",
    description:
      "Capacity factor and dispatchability — the difference between energy and power.",
    sources: ["nuclear", "solar", "wind", "gas"],
    normalize: "none",
    year: 2024,
    highlightedDimensions: ["capacityFactor", "dispatchability"],
    rhetoricalPoint:
      "Baseload and intermittent sources are not interchangeable. Capacity factor measures how often a plant actually generates. Dispatchability measures whether you can turn it on when you need it.",
  },
  {
    slug: "cost-story",
    title: "The Cost Story",
    description:
      "Levelized cost of energy and how long it takes to build.",
    sources: ["nuclear", "solar", "wind", "gas", "coal"],
    normalize: "none",
    year: 2024,
    highlightedDimensions: ["lcoe", "constructionTime"],
    rhetoricalPoint:
      "Solar is cheapest unsubsidized per MWh. But LCOE alone misses storage costs, dispatchability, and the 60-80 year operating life of a nuclear plant compared to 25 years for solar panels.",
  },
  {
    slug: "land-hungry",
    title: "Land Hungry",
    description:
      "The spatial footprint of the energy transition.",
    sources: ["nuclear", "solar", "wind"],
    normalize: "nuclear",
    year: 2024,
    highlightedDimensions: ["landUse"],
    rhetoricalPoint:
      "Powering a country with renewables requires hundreds of times more land than nuclear. This isn't an argument against renewables — it's a constraint on how the transition actually plays out.",
  },
];
