# Country Electricity Generation Mix — Module 6 Seed Data

Compiled: 2026-04-12
Data year: 2024 (FY 2024-25 for India)
Sources: Fraunhofer ISE (Germany), RTE (France), EIA/Wolf Street (US), ISEP (Japan), Ember/WNA (South Korea), DUKES (UK), China NBS (China), Ministry of Power + CEA (India)

Status: **PRE-SEEDING for Module 6 "What If? Policy Simulator".** Module 6 is deferred until after Ship 1 validates with 10 humans of feedback. These values are ready to merge into `data-src/countries.ts` when Module 6 starts. Exact per-source TWh values should be re-verified against the primary source at that time — the numbers here were pulled from news summaries and research-org reports, not direct agency CSVs.

## Countries covered

| Country | Total TWh | Nuclear | Coal  | Gas   | Renewable | Est. CO₂ (g/kWh) | Data Year |
|---------|-----------|---------|-------|-------|-----------|------------------|-----------|
| Germany | 510       | 0%      | 19%   | 17%   | 63%       | ~268             | 2024      |
| France  | 536       | 67%     | 0.1%  | 3%    | 28%       | ~38              | 2024      |
| US      | 4,304     | 18%     | 15%   | 43%   | 24%       | ~342             | 2024      |
| Japan   | ~987      | 8%      | 28%   | 29%   | 27%       | ~480             | 2024      |
| S Korea | 607       | 31%     | 33%   | 25%   | 11%       | ~450             | 2024      |
| UK      | 285       | 14%     | 0.6%  | 30%   | 50%       | ~180             | 2024      |
| China   | 9,936     | 4%      | 59%   | 3%    | 32%       | ~507             | 2024      |
| India   | 1,826     | 3%      | ~65%  | small | ~25%      | ~600             | FY24-25   |

## Per-country generation detail (TWh)

### Germany (2024) — "the counterfactual"
- **Total:** ~510 TWh
- Nuclear: **0** (first full year without own nuclear since 1962 after April 2023 shutdown)
- Lignite: 71.1
- Hard coal: 24.2
- Natural gas: 89.1
- Wind: 136.4 (33% of net public generation)
- Solar: 72.2 (record high)
- Hydro: ~23 (4.5% of gross)
- Biomass: ~42
- Other renewables: ~10
- **Renewable share:** 62.7% of net public generation (record)
- **Grid CO2 intensity (estimate):** ~268 gCO2/kWh
- **Rhetorical frame:** The most famous post-nuclear case study in the world. Closed 8.4 GW of zero-carbon nuclear in 2011-2023 while burning 95 TWh of coal annually. The "what if Germany hadn't shut down its nuclear" counterfactual is the most dramatic possible use of the What If? simulator.
- **Source:** Fraunhofer ISE 2025 press release + Clean Energy Wire fact sheet

### France (2024) — "the pro-nuclear baseline"
- **Total:** 536.5 TWh (5-year high)
- Nuclear: 361.7 (67% — the highest share of any major economy)
- Hydro: 74.7 (14%, highest since 2013)
- Wind: 47
- Solar: 23
- Gas: 17.4 (down from 29.2 in 2023)
- Coal: 0.7
- Oil: 1.8
- Bioenergy: ~10
- **Low-carbon share:** 95% of generation (first time ever)
- **Fossil share:** lowest since early 1950s
- **Grid CO2 intensity (estimate):** ~38 gCO2/kWh
- **Rhetorical frame:** The counterfactual-proof. Same continent as Germany, opposite policy choice, one-sixth the grid emissions. "What if France had followed Germany's nuclear shutdown?" is equally dramatic.
- **Source:** RTE Annual Review 2024

### United States (2024)
- **Total:** 4,304 TWh (record)
- Natural gas: ~1,838 (42.7% — record matched from 2023)
- Coal: 652.76 (14.9% — record low share)
- Nuclear: ~775 (~18%)
- Wind: 453.45 (10.3%)
- Solar: 303.17 (6.9% — surged 26.9% YoY, surpassed hydro)
- Hydro: 242.23 (~5.6%)
- Bioenergy/geo: rest
- **Renewable share:** 24.2%
- **Grid CO2 intensity (estimate):** ~342 gCO2/kWh
- **Rhetorical frame:** Largest nuclear fleet globally but new nuclear stagnant. Gas displacing coal faster than wind/solar are displacing gas. The "what if US restarted Shoreham and Indian Point + built 10 new plants" scenario.
- **Source:** EIA via Wolf Street + Electrek / Enerdata

### Japan (2024) — "post-Fukushima recovery"
- **Total:** ~987 TWh (extrapolated from 2022's 832.7 TWh + ISEP growth)
- LNG/Gas: ~287 (29.1%)
- Coal: ~278 (28.2%)
- Nuclear: ~81 (8.2%, up from 7.7% in 2023)
- Solar: ~113 (11.4%)
- Hydro: ~78 (7.9%)
- Biomass: ~58 (5.9%)
- Wind: ~11 (1.13%)
- Oil + other: ~77 (7.8%)
- **Renewable share:** 26.7%
- **Grid CO2 intensity (estimate):** ~480 gCO2/kWh
- **Rhetorical frame:** Only major economy still actively restarting nuclear. 33 reactors were operable pre-Fukushima, 13 operational as of 2024. The "what if Japan restarted all pre-Fukushima reactors" scenario would displace most of their LNG + coal.
- **Source:** ISEP 2024 renewable share report

### South Korea (2024) — "successful nuclear buildout"
- **Total:** 607 TWh
- Coal: 198 (33%)
- Nuclear: 189 (30%)
- Natural gas: 151 (25%)
- Solar: 33.4 (6%)
- Biomass/waste: 11.8 (2%)
- Hydro: 9.0 (1%)
- Oil: 7.0 (1%)
- Wind: 3.4
- **Renewable share:** ~11%
- **Grid CO2 intensity (estimate):** ~450 gCO2/kWh
- **Rhetorical frame:** Has successfully executed on nuclear buildout. Government plan targets 35.6% nuclear by 2038. Shows what a sustained pro-nuclear policy looks like.
- **Source:** WNA country profile + Ember

### United Kingdom (2024) — "offshore wind + new nuclear"
- **Total:** 285 TWh
- Gas: 84.2 (29.5%)
- Wind: 83.3 (offshore 48.5, onshore 34.7) — 29.2%
- Nuclear: 40.6 (14.3%)
- Solar: 14.4 (5%)
- Coal: 1.6 (last coal plant Ratcliffe-on-Soar closed Sept 30, 2024 — first G7 nation to fully phase out coal)
- Hydro: ~6
- Bioenergy: ~55
- **Renewable share:** 50.4% (first time crossing 50%)
- **Grid CO2 intensity (estimate):** ~180 gCO2/kWh
- **Rhetorical frame:** Simultaneously leading on wind AND building Hinkley Point C + Sizewell C. Shows the "both/and" strategy in real operation. Coal phaseout complete.
- **Source:** DUKES (Digest of UK Energy Statistics) 2025 + RenewableUK

### China (2024) — "fastest nuclear buildout globally"
- **Total:** 9,936 TWh (~2.3× US)
- Coal: 5,871 (59% — absolute amount still rising)
- Hydro: 1,285 (13%)
- Wind: 989 (10%)
- Solar: 853 (9%)
- Nuclear: 444 (4%)
- Natural gas: 283 (3%)
- Bio/other thermal: ~200
- **Renewable share:** 32%
- **Grid CO2 intensity (estimate):** ~507 gCO2/kWh
- **Rhetorical frame:** Dominates global nuclear construction (most reactors under build of any country) AND solar/wind AND coal. The scale is so large that even 4% nuclear share = 444 TWh — more than France's entire nuclear output. The "what if China's coal became nuclear" scenario is the single largest possible CO2 reduction in the simulator.
- **Source:** China NBS + Ember

### India (FY 2024-25)
- **Total:** 1,826 TWh
- Thermal (mostly coal): ~1,445 (79% — coal dominates)
- Hydro: ~148 (8%)
- Solar: 148 (8.1% — 23% YoY growth)
- Wind: ~75 (estimated, 4%)
- Nuclear: ~55 (3%, +18% YoY growth)
- Other renewables: ~100
- **Renewable share:** ~25% non-fossil
- **Grid CO2 intensity (estimate):** ~600 gCO2/kWh
- **Rhetorical frame:** Fastest-growing electricity demand globally. Energy transition choices here will dominate 21st-century emissions. Nuclear growing from low base but 18% annual growth is meaningful. The "what if India builds 50 reactors" scenario.
- **Source:** Ministry of Power "Power Sector at a Glance" + Vasudha Foundation FY24-25 summary

## Grid CO2 intensity methodology

The "Est. CO2" column is computed from Ember/IPCC lifecycle emission factors:

```
nuclear: 12 gCO2/kWh
solar:   48
wind:    11
gas:     490
coal:    820
hydro:   24
oil:     ~650 (estimate)
bio:     ~230 (estimate)
```

For each country, grid intensity = Σ(source_TWh × source_gCO2_per_kWh) / total_TWh. These estimates are approximate — official grid intensities from IEA or country agencies should replace them when Module 6 ships. Published "official" values tend to be 10-20% higher than my lifecycle-based estimates because they also include transmission losses and sometimes operational (not lifecycle) emissions.

## Ready-to-paste TypeScript

```ts
// data-src/countries.ts — ships with Module 6

import type { Citation } from "@/lib/data-types";

export interface CountryEnergyMix {
  id: string;
  label: string;
  year: number;
  totalGenerationTWh: number;
  generationBySource: {
    nuclear: number;
    coal: number;
    gas: number;
    oil: number;
    solar: number;
    wind: number;
    hydro: number;
    bioenergy: number;
    other: number;
  };
  gridCO2Intensity: {
    value: number;
    unit: "gCO2/kWh";
    methodology: "lifecycle-weighted" | "operational-only";
  };
  rhetoricalFrame: string;
  citation: Citation;
}

export const countries: ReadonlyArray<CountryEnergyMix> = [
  {
    id: "de",
    label: "Germany",
    year: 2024,
    totalGenerationTWh: 510,
    generationBySource: {
      nuclear: 0,
      coal: 95.3, // lignite 71.1 + hard coal 24.2
      gas: 89.1,
      oil: 0,
      solar: 72.2,
      wind: 136.4,
      hydro: 23,
      bioenergy: 42,
      other: 10,
    },
    gridCO2Intensity: { value: 268, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "The counterfactual. Closed 8.4 GW of zero-carbon nuclear while burning 95 TWh of coal annually.",
    citation: {
      bibtex_key: "fraunhofer2025germanyelec_de",
      author: "Fraunhofer ISE",
      title: "Public Electricity Generation 2024 — Germany",
      year: 2025,
      publisher: "Fraunhofer Institute for Solar Energy Systems",
      url: "https://www.ise.fraunhofer.de/en/press-media/press-releases/2025/public-electricity-generation-2024-renewable-energies-cover-more-than-60-percent-of-german-electricity-consumption-for-the-first-time.html",
      accessed: "2026-04-12",
    },
  },
  {
    id: "fr",
    label: "France",
    year: 2024,
    totalGenerationTWh: 536.5,
    generationBySource: {
      nuclear: 361.7,
      coal: 0.7,
      gas: 17.4,
      oil: 1.8,
      solar: 23,
      wind: 47,
      hydro: 74.7,
      bioenergy: 10,
      other: 0,
    },
    gridCO2Intensity: { value: 38, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "The counterfactual-proof. Same continent as Germany, opposite policy, one-sixth the grid emissions.",
    citation: {
      bibtex_key: "rte2025annualreview_fr",
      author: "RTE France",
      title: "French Annual Electricity Review 2024",
      year: 2025,
      publisher: "Réseau de Transport d'Électricité",
      url: "https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings",
      accessed: "2026-04-12",
    },
  },
  {
    id: "us",
    label: "United States",
    year: 2024,
    totalGenerationTWh: 4304,
    generationBySource: {
      nuclear: 775,
      coal: 652.76,
      gas: 1838,
      oil: 10,
      solar: 303.17,
      wind: 453.45,
      hydro: 242.23,
      bioenergy: 50,
      other: 20,
    },
    gridCO2Intensity: { value: 342, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Largest nuclear fleet globally, but new nuclear stagnant. Gas displacing coal faster than wind/solar are displacing gas.",
    citation: {
      bibtex_key: "eia2025uselec_us",
      author: "U.S. Energy Information Administration",
      title: "Electric Power Annual 2024",
      year: 2025,
      publisher: "EIA",
      url: "https://www.eia.gov/todayinenergy/detail.php?id=65445",
      accessed: "2026-04-12",
    },
  },
  {
    id: "jp",
    label: "Japan",
    year: 2024,
    totalGenerationTWh: 987,
    generationBySource: {
      nuclear: 81,
      coal: 278,
      gas: 287,
      oil: 66,
      solar: 113,
      wind: 11,
      hydro: 78,
      bioenergy: 58,
      other: 15,
    },
    gridCO2Intensity: { value: 480, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Only major economy still actively restarting nuclear. Pre-Fukushima had 33 reactors operable; 13 operational in 2024.",
    citation: {
      bibtex_key: "isep2025japanelec_jp",
      author: "Institute for Sustainable Energy Policies",
      title: "2024 Share of Electricity from Renewable Energy Resources in Japan",
      year: 2025,
      publisher: "ISEP",
      url: "https://www.isep.or.jp/en/1561/",
      accessed: "2026-04-12",
    },
  },
  {
    id: "kr",
    label: "South Korea",
    year: 2024,
    totalGenerationTWh: 607,
    generationBySource: {
      nuclear: 189,
      coal: 198,
      gas: 151,
      oil: 7,
      solar: 33.4,
      wind: 3.4,
      hydro: 9,
      bioenergy: 11.8,
      other: 4.4,
    },
    gridCO2Intensity: { value: 450, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Has successfully executed on nuclear buildout. 11th Basic Plan targets 35.6% nuclear by 2038.",
    citation: {
      bibtex_key: "wna2025skoreaelec_kr",
      author: "World Nuclear Association",
      title: "Nuclear Power in South Korea country profile",
      year: 2025,
      publisher: "WNA",
      url: "https://world-nuclear.org/information-library/country-profiles/countries-o-s/south-korea",
      accessed: "2026-04-12",
    },
  },
  {
    id: "uk",
    label: "United Kingdom",
    year: 2024,
    totalGenerationTWh: 285,
    generationBySource: {
      nuclear: 40.6,
      coal: 1.6,
      gas: 84.2,
      oil: 0,
      solar: 14.4,
      wind: 83.3,
      hydro: 6,
      bioenergy: 55,
      other: 0,
    },
    gridCO2Intensity: { value: 180, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Simultaneously leading on offshore wind AND building new nuclear (Hinkley + Sizewell). First G7 nation to fully phase out coal (Sept 2024).",
    citation: {
      bibtex_key: "dukes2025ukelec_uk",
      author: "UK Department for Energy Security and Net Zero",
      title: "Digest of UK Energy Statistics (DUKES) — Electricity 2024",
      year: 2025,
      publisher: "DESNZ",
      url: "https://assets.publishing.service.gov.uk/media/6942c20a8f4636fa2c547ddc/Energy_Trends_December_2025.pdf",
      accessed: "2026-04-12",
    },
  },
  {
    id: "cn",
    label: "China",
    year: 2024,
    totalGenerationTWh: 9936,
    generationBySource: {
      nuclear: 444,
      coal: 5871,
      gas: 283,
      oil: 0,
      solar: 853,
      wind: 989,
      hydro: 1285,
      bioenergy: 150,
      other: 61,
    },
    gridCO2Intensity: { value: 507, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Dominates global nuclear construction, solar, wind, AND coal. 4% nuclear share = 444 TWh, more than France's entire nuclear output.",
    citation: {
      bibtex_key: "ember2025chinaelec_cn",
      author: "Ember Energy",
      title: "China Energy Transition Review 2025",
      year: 2025,
      publisher: "Ember",
      url: "https://ember-energy.org/latest-insights/china-energy-transition-review-2025/",
      accessed: "2026-04-12",
    },
  },
  {
    id: "in",
    label: "India",
    year: 2024, // FY 2024-25
    totalGenerationTWh: 1826,
    generationBySource: {
      nuclear: 55,
      coal: 1200, // most of the 1445 thermal is coal
      gas: 100,
      oil: 10,
      solar: 148,
      wind: 75,
      hydro: 148,
      bioenergy: 50,
      other: 40,
    },
    gridCO2Intensity: { value: 600, unit: "gCO2/kWh", methodology: "lifecycle-weighted" },
    rhetoricalFrame: "Fastest-growing electricity demand globally. Energy transition choices here will dominate 21st-century emissions.",
    citation: {
      bibtex_key: "cea2025indiaelec_in",
      author: "Central Electricity Authority",
      title: "Power Sector at a Glance ALL INDIA (FY 2024-25)",
      year: 2025,
      publisher: "Ministry of Power, Government of India",
      url: "https://powermin.gov.in/en/content/power-sector-glance-all-india",
      accessed: "2026-04-12",
    },
  },
];
```

## Module 6 cascade math (reference)

When the user drags "replace X% of coal with nuclear" in country C:

```
displacedCoalTWh = C.generationBySource.coal × slider_pct
nuclearAddedTWh  = displacedCoalTWh

CO2Saved    = (coal_gCO2 - nuclear_gCO2) × displacedCoalTWh × 1e9 / 1e6  // Mt CO2/year
deathsAverted = (coal_deaths_per_TWh - nuclear_deaths_per_TWh) × displacedCoalTWh
landReturned  = (coal_km2_per_TWh - nuclear_km2_per_TWh) × displacedCoalTWh  // km²

newGridCO2Intensity = recompute Σ(source × intensity) / total
```

All coefficients come from `data-src/sources.ts` (lifecycle CO2, deaths per TWh, land use). Module 6 just needs per-country totals + slider positions.

## Gaps and flags to resolve before Module 6 ships

1. **Germany fossil generation doesn't quite reconcile** with 510 TWh total — 95.3 coal + 89.1 gas = 184 TWh fossil (36%), but "renewables 62.7%" implies ~37% fossil, so numbers are consistent within rounding. Oil + misc thermal accounts for the rest.

2. **Japan total generation is extrapolated** from 2022's 832.7 TWh using ISEP 2024 percentage shifts. Should be replaced with Agency for Natural Resources and Energy (METI) official 2024 total.

3. **US nuclear TWh is approximated** at ~775 TWh (~18% of 4,304). Wolf Street reports exact % but not exact TWh. Pull from EIA Electric Power Annual 2024 when it publishes.

4. **India's coal vs thermal split** — I allocated 1,200 of the 1,445 thermal TWh to coal. Actual split of thermal between coal / gas / diesel varies; CEA breakdown should replace my estimate.

5. **China "other thermal"** is ~200 TWh (biomass + waste + smaller fossil). Not broken out in the summary data I found.

6. **Bioenergy emission factor** (230 gCO2/kWh) is an estimate. IPCC AR5 gives 230 for dedicated biomass but the range is wide (130-420) depending on feedstock and supply chain.

7. **Grid CO2 intensity methodology note:** My lifecycle-weighted numbers will be lower than many "official" figures (which often report operational only or include transmission/distribution losses). Module 6 should cite the source of its chosen methodology.

8. **UK bioenergy is large (55 TWh)** and dominated by Drax, which burns imported wood pellets. Drax's emissions are disputed — the 230 estimate may be too low.
