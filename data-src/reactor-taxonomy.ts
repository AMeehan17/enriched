import type {
  TaxonomyTag,
  FissileElementId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  XFactorId,
  XFactorGroup,
  ReactorTaxonomy,
} from "@/lib/reactor-types";

/**
 * REACTOR TAXONOMY — the F/C/X controlled vocabulary for Module 2.
 *
 * SCHEMA v2 (2026-04-20):
 *   Fuel is now THREE dimensions: fissile element → optional kickstarter
 *   → fuel form. Coolant expanded: salt chemistries split into 3, liquid
 *   metal species split into 3. Water stays unified (PWR/BWR distinction
 *   is reactor architecture, not coolant chemistry — displayed on each
 *   match card as a derived reactorType field).
 *
 * Every chip in the Reactor Builder UI renders from one of these tags.
 * Each tag carries:
 *   - label: display text on the chip
 *   - oneLineHook: ≤1 sentence, shown on chip as hook line
 *   - popoverBody: ≤1 paragraph, shown in tag popover body
 *   - citations: ≥1 primary source per tag
 *
 * CITATION RULES (per CLAUDE.md):
 *   - Every citation must target an independently verifiable primary source
 *   - bibtex_key pattern: {author}{year}{shortname}_{tag-id}
 *   - All citation hosts must be in lib/citation-allowlist.ts
 */

// ─── FISSILE ELEMENT TAGS ───────────────────────────────────────────

const fissileElementTags: ReadonlyArray<
  TaxonomyTag & { id: FissileElementId }
> = [
  {
    id: "u-235",
    label: "Uranium-235",
    oneLineHook:
      "The fissile isotope powering 99% of commercial reactors — enriched from natural uranium's 0.7% to reactor grade.",
    popoverBody:
      "U-235 is the only naturally-occurring fissile isotope heavy enough to sustain a chain reaction in a reactor. Natural uranium is 99.3% U-238 (fertile but not fissile) and just 0.7% U-235. Commercial reactors require enrichment to concentrate U-235: LEU at 3-5% for conventional light-water reactors, HALEU at 5-20% for most advanced designs. The enrichment step is the dominant cost and geopolitical bottleneck in the nuclear fuel cycle.",
    citations: [
      {
        bibtex_key: "wna2024u235_u-235",
        author: "World Nuclear Association",
        title: "Uranium Enrichment",
        year: 2024,
        publisher: "World Nuclear Association",
        url: "https://world-nuclear.org/information-library/nuclear-fuel-cycle/conversion-enrichment-and-fabrication/uranium-enrichment",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "th-232",
    label: "Thorium-232",
    oneLineHook:
      "Not fissile itself — breeds fissile U-233 when bombarded. Requires a kickstarter to get started.",
    popoverBody:
      "Th-232 is fertile but not fissile — it cannot sustain a chain reaction alone. Hit it with a neutron and it transmutes through protactinium-233 into U-233, which is fissile. Thorium reactors always need a fissile kickstarter (U-235 or Pu-239) to start the initial chain reaction, which then breeds U-233 for self-sustaining operation. Thorium is 3-4x more abundant than uranium in the Earth's crust, produces less long-lived transuranic waste, and the bred U-233 contains U-232 contaminant that makes weapons fabrication very difficult.",
    citations: [
      {
        bibtex_key: "iaea2005thorium_th-232",
        author: "International Atomic Energy Agency",
        title: "Thorium Fuel Cycle — Potential Benefits and Challenges",
        year: 2005,
        publisher: "IAEA",
        url: "https://www.iaea.org/publications/7192/thorium-fuel-cycle-potential-benefits-and-challenges",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "pu-239",
    label: "Plutonium-239",
    oneLineHook:
      "Bred from U-238 in operating reactors. Typically used as recycled fuel (MOX) rather than from scratch.",
    popoverBody:
      "Pu-239 is fissile but doesn't exist in nature — it's created inside operating reactors when U-238 (the 99.3% bulk of natural uranium) absorbs a neutron and transmutes. Spent fuel from conventional reactors contains ~1% Pu-239, which can be reprocessed and blended with depleted uranium to make MOX fuel. France operates the largest MOX program, loading it in roughly 20% of its reactor fleet. Starting a reactor on Pu-239 alone is rare; it's more commonly a fuel-cycle closure strategy for recycling spent fuel.",
    citations: [
      {
        bibtex_key: "wna2024mox_pu-239",
        author: "World Nuclear Association",
        title: "Mixed Oxide (MOX) Fuel",
        year: 2024,
        publisher: "World Nuclear Association",
        url: "https://world-nuclear.org/information-library/nuclear-fuel-cycle/fuel-recycling/mixed-oxide-fuel-mox",
        accessed: "2026-04-20",
      },
    ],
  },
];

// ─── KICKSTARTER TAGS ───────────────────────────────────────────────

const kickstarterTags: ReadonlyArray<TaxonomyTag & { id: KickstarterId }> = [
  {
    id: "u-235-kickstart",
    label: "U-235 kickstarter",
    oneLineHook:
      "Use enriched U-235 to light the fire, then let Th-232 breed U-233 for sustained operation.",
    popoverBody:
      "The standard kickstarter for a thorium fuel cycle. Enriched U-235 (LEU or HALEU) provides the initial fissile inventory to start the chain reaction. As the reactor runs, neutrons captured by Th-232 breed U-233, which takes over as the primary fissile material. This is the path most in-development thorium reactors (Copenhagen Atomics, Flibe Energy) use because U-235 enrichment infrastructure already exists.",
    citations: [
      {
        bibtex_key: "iaea2005thorium_u-235-kickstart",
        author: "International Atomic Energy Agency",
        title: "Thorium Fuel Cycle — Potential Benefits and Challenges",
        year: 2005,
        publisher: "IAEA",
        url: "https://www.iaea.org/publications/7192/thorium-fuel-cycle-potential-benefits-and-challenges",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "pu-239-kickstart",
    label: "Pu-239 kickstarter",
    oneLineHook:
      "Use plutonium from spent fuel to start a thorium cycle — closes two fuel cycles at once.",
    popoverBody:
      "Starting a thorium reactor with plutonium from reprocessed spent fuel does double duty: it consumes transuranic waste that would otherwise need millennia of geologic storage, while simultaneously seeding a thorium breeding cycle. After the Pu-239 inventory is fissioned, bred U-233 takes over. The challenge is reprocessing infrastructure — commercial plutonium recovery is operational only in France, UK, Russia, and Japan. Proposed for some advanced molten salt designs targeting both waste burning and thorium utilization.",
    citations: [
      {
        bibtex_key: "oecd2021fuelcycles_pu-239-kickstart",
        author: "OECD Nuclear Energy Agency",
        title: "Advanced Fuel Cycles: Role and Research Programme",
        year: 2021,
        publisher: "OECD/NEA",
        url: "https://www.oecd-nea.org/jcms/pl_61089/advanced-fuel-cycles-role-and-research-programme",
        accessed: "2026-04-20",
      },
    ],
  },
];

// ─── FUEL FORM TAGS ─────────────────────────────────────────────────

const fuelFormTags: ReadonlyArray<TaxonomyTag & { id: FuelFormId }> = [
  {
    id: "ceramic-pellets",
    label: "Ceramic pellets",
    oneLineHook:
      "UO₂ pellets stacked in zirconium cladding — the fuel form in >90% of operating reactors.",
    popoverBody:
      "The workhorse fuel form of the global fleet. Uranium dioxide (UO₂) pellets, each about the size of an eraser, are stacked inside zirconium alloy cladding tubes to form fuel rods. Rods are bundled into assemblies. The ceramic is stable at high temperatures, the cladding contains fission products, and the assembly fits the decades-old supply chain that powers 400+ commercial reactors worldwide. Straightforward to fabricate, well-understood, low proliferation risk at LEU enrichment.",
    citations: [
      {
        bibtex_key: "wna2024fuel_ceramic-pellets",
        author: "World Nuclear Association",
        title: "Nuclear Fuel",
        year: 2024,
        publisher: "World Nuclear Association",
        url: "https://world-nuclear.org/information-library/nuclear-fuel-cycle/nuclear-power-reactors/nuclear-fuel",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "metal",
    label: "Metallic fuel",
    oneLineHook:
      "Uranium-zirconium alloy in metallic form — higher fissile density, higher burnup, inherent safety.",
    popoverBody:
      "Metallic fuel (typically U-Zr or U-Pu-Zr alloy) is denser than ceramic fuel and offers strong negative reactivity feedback — as temperature rises, the fuel expands and reduces the chain reaction naturally. This makes metallic-fueled fast reactors inherently safe against certain transients without requiring active intervention. EBR-II demonstrated the physics in 1986 by withstanding a loss-of-flow event with all safety systems disabled. Natrium (TerraPower) and similar sodium fast reactors use HALEU metallic fuel to achieve high burnup and longer refueling intervals.",
    citations: [
      {
        bibtex_key: "anl2024metalfuel_metal",
        author: "Argonne National Laboratory",
        title: "Metallic Fuel for Fast Reactors",
        year: 2024,
        publisher: "ANL",
        url: "https://www.anl.gov/topic/nuclear-energy",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "triso",
    label: "TRISO particles",
    oneLineHook:
      "Poppy-seed-sized fuel kernels with built-in containment layers — can't melt under credible conditions.",
    popoverBody:
      "Each TRISO (tri-structural isotropic) particle is a uranium kernel wrapped in three concentric layers of carbon and silicon carbide. The SiC layer acts as a miniature pressure vessel, retaining fission products up to ~1600°C without structural failure. TRISO can be formed into cylindrical compacts (prismatic reactors) or tennis-ball-sized pebbles (pebble-bed reactors). The fuel's accident tolerance is physical, not engineered — it cannot melt under credible reactor conditions. X-energy's Xe-100 and Kairos KP-FHR both use TRISO.",
    citations: [
      {
        bibtex_key: "inl2021triso_triso",
        author: "Idaho National Laboratory",
        title: "TRISO Fuel: The Most Robust Nuclear Fuel on Earth",
        year: 2021,
        publisher: "INL",
        url: "https://inl.gov/triso-fuel/",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "molten-salt",
    label: "Dissolved in molten salt",
    oneLineHook:
      "Fuel IS the coolant — fissile material dissolved directly in a molten salt carrier (locks coolant to a salt).",
    popoverBody:
      "In molten salt fuel reactors, uranium or thorium is dissolved in a fluoride or chloride salt mixture. The liquid circulates through the core, serving as both fuel and primary coolant simultaneously. This eliminates solid fuel fabrication, enables online refueling and fission product removal, and operates at atmospheric pressure. The physics was proven at Oak Ridge's Molten Salt Reactor Experiment (MSRE), which operated from 1965-1969. IMPORTANT: choosing molten-salt fuel form locks the coolant to a salt chemistry (FLiBe, FLiNaK, or Chloride) — the fuel and coolant are the same substance.",
    citations: [
      {
        bibtex_key: "ornl1969msre_molten-salt",
        author: "Oak Ridge National Laboratory",
        title: "Experience with the Molten Salt Reactor Experiment",
        year: 1969,
        publisher: "ORNL",
        url: "https://www.ornl.gov/publication/experience-molten-salt-reactor-experiment",
        accessed: "2026-04-20",
      },
      {
        bibtex_key: "iaea2021msr_molten-salt",
        author: "International Atomic Energy Agency",
        title: "Status of Molten Salt Reactor Technology",
        year: 2021,
        publisher: "IAEA",
        url: "https://www.iaea.org/publications/15116/status-of-molten-salt-reactor-technology",
        accessed: "2026-04-20",
      },
    ],
  },
];

// ─── COOLANT TAGS ───────────────────────────────────────────────────

const coolantTags: ReadonlyArray<TaxonomyTag & { id: CoolantId }> = [
  {
    id: "light-water",
    label: "Light water",
    oneLineHook:
      "Ordinary H₂O — the coolant and moderator for >90% of operating reactors. Used in both PWRs and BWRs.",
    popoverBody:
      "Light water (H₂O) serves as both coolant and neutron moderator in pressurized water reactors (PWRs) and boiling water reactors (BWRs). Its moderation properties slow neutrons efficiently, enabling low-enriched uranium fuel. The trade-off: light-water systems require high pressure (155 bar in PWRs) to prevent boiling at operating temperatures, limiting outlet temperatures to ~320°C. The PWR/BWR distinction is an architecture choice (two loops vs one, pressurized vs boiling in core), not a coolant chemistry difference — both use the same water.",
    citations: [
      {
        bibtex_key: "nrc2024reactortypes_light-water",
        author: "U.S. Nuclear Regulatory Commission",
        title: "Types of Nuclear Reactors",
        year: 2024,
        publisher: "NRC",
        url: "https://www.nrc.gov/reading-rm/basic-ref/students/reactors.html",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "heavy-water",
    label: "Heavy water",
    oneLineHook:
      "Deuterium oxide (D₂O) — absorbs fewer neutrons than H₂O, enabling natural uranium fuel. CANDU reactors.",
    popoverBody:
      "Heavy water uses deuterium (hydrogen with one extra neutron) instead of ordinary hydrogen. D₂O absorbs far fewer neutrons during moderation, which means the reactor can sustain a chain reaction with natural uranium (0.7% U-235) instead of requiring enrichment. Canada's CANDU reactor fleet is the primary commercial application. The trade-off is that heavy water itself is expensive to produce and the reactor design requires a separate moderator circuit. Reactors using heavy water are typically classified PHWR (pressurized heavy water reactor).",
    citations: [
      {
        bibtex_key: "iaea2002heavywater_heavy-water",
        author: "International Atomic Energy Agency",
        title: "Heavy Water Reactors: Status and Projected Development",
        year: 2002,
        publisher: "IAEA",
        url: "https://www.iaea.org/publications/6390/heavy-water-reactors-status-and-projected-development",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "helium",
    label: "Helium",
    oneLineHook:
      "Inert gas coolant enabling 700–950°C outlet temperatures — the key to process heat.",
    popoverBody:
      "Helium is chemically inert (no corrosion, no activation, no phase changes) and can operate at very high temperatures. High-temperature gas-cooled reactors (HTGRs) use helium to reach 700–950°C outlet temperatures, hot enough to drive hydrogen production, industrial process heat, and high-efficiency Brayton cycle turbines. The low volumetric heat capacity of gas means helium-cooled cores need higher flow rates and pressure than liquid-cooled designs, but the thermal efficiency gains and process-heat applications can justify it.",
    citations: [
      {
        bibtex_key: "inl2023htgr_helium",
        author: "Idaho National Laboratory",
        title: "High-Temperature Gas-Cooled Reactor Technology",
        year: 2023,
        publisher: "INL",
        url: "https://inl.gov/research-program/high-temperature-reactor/",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "flibe",
    label: "FLiBe",
    oneLineHook:
      "Lithium-beryllium fluoride salt — excellent heat transfer at atmospheric pressure with built-in neutron moderation.",
    popoverBody:
      "FLiBe (2LiF-BeF₂) is a molten fluoride salt used as both coolant and fuel carrier in molten salt reactors, or as a coolant for solid-fuel FHRs. It operates at atmospheric pressure, has high volumetric heat capacity, and provides neutron moderation through lithium and beryllium. The low operating pressure eliminates heavy pressure vessels. FLiBe is transparent when pure, allowing visual fuel inspection. Used by Kairos Power's KP-FHR (as coolant), Flibe Energy's LFTR (as fuel carrier), and historically by Oak Ridge's MSRE. Beryllium is toxic — handling requires appropriate containment.",
    citations: [
      {
        bibtex_key: "ornl2006flibe_flibe",
        author: "Oak Ridge National Laboratory",
        title: "Thermophysical Properties of the LiF-BeF₂ Molten Salt",
        year: 2006,
        publisher: "ORNL",
        url: "https://www.ornl.gov/publication/thermophysical-properties-lif-bef2-molten-salt",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "flinak",
    label: "FLiNaK",
    oneLineHook:
      "Lithium-sodium-potassium fluoride — cheaper than FLiBe, no beryllium toxicity, used in some advanced MSRs.",
    popoverBody:
      "FLiNaK (LiF-NaF-KF, typically 46.5-11.5-42 mol%) is a eutectic fluoride salt mixture that avoids FLiBe's beryllium toxicity at the cost of slightly worse neutron economy (K and Na absorb more neutrons than Be). Operates at atmospheric pressure like FLiBe, with a lower melting point (~454°C vs FLiBe's 459°C) making it marginally easier to handle. Used in research reactors and proposed for some advanced molten salt designs where proliferation concerns around beryllium or cost are priorities.",
    citations: [
      {
        bibtex_key: "ornl2009flinak_flinak",
        author: "Oak Ridge National Laboratory",
        title: "FLiNaK Salt Handling Technology and Thermophysical Properties",
        year: 2009,
        publisher: "ORNL",
        url: "https://www.ornl.gov/publication/flinak-salt-handling",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "chloride-salt",
    label: "Chloride salt",
    oneLineHook:
      "Chloride-based molten salt (NaCl-UCl₃, MgCl₂-KCl) — fast-spectrum, can burn transuranics.",
    popoverBody:
      "Chloride salts contain heavier atoms than fluoride salts, which means they don't moderate neutrons as effectively — making them well-suited for FAST-spectrum molten salt reactors. The fast spectrum enables breeding and transuranic waste burning. Common compositions include NaCl-UCl₃ (sodium chloride-uranium chloride) for the fuel salt and MgCl₂-KCl for coolant salt. TerraPower's molten chloride fast reactor (MCFR) and several other fast-spectrum MSR concepts use chloride chemistry. The trade-off is more complex corrosion chemistry than fluoride systems.",
    citations: [
      {
        bibtex_key: "terrapower2024mcfr_chloride-salt",
        author: "TerraPower",
        title: "Molten Chloride Fast Reactor",
        year: 2024,
        publisher: "TerraPower",
        url: "https://www.terrapower.com/our-work/molten-chloride-fast-reactor/",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "sodium",
    label: "Sodium",
    oneLineHook:
      "Liquid metal for fast-spectrum reactors — superb heat transfer, atmospheric pressure, reacts with water.",
    popoverBody:
      "Liquid sodium operates at atmospheric pressure, has excellent thermal conductivity (~100x that of water), and does not moderate neutrons, making it the standard coolant for fast-spectrum reactors. Fast reactors can breed fuel, burn actinides from spent fuel, and achieve higher fuel utilization than thermal reactors. The trade-off: sodium reacts vigorously with water and air, requiring sealed intermediate heat-exchange loops and inert-atmosphere maintenance. Over 20 sodium-cooled fast reactors have operated worldwide, accumulating hundreds of reactor-years of experience (EBR-II, BN-600, BN-800).",
    citations: [
      {
        bibtex_key: "iaea2024sfr_sodium",
        author: "International Atomic Energy Agency",
        title: "Fast Reactor Technology: Sodium-Cooled Fast Reactor",
        year: 2024,
        publisher: "IAEA",
        url: "https://www.iaea.org/topics/fast-reactors",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "lead",
    label: "Lead",
    oneLineHook:
      "Dense liquid metal — no sodium-water reaction risk, high boiling point, but corrosive to steel.",
    popoverBody:
      "Lead is a liquid metal coolant that operates at atmospheric pressure without reacting with water or air. Its high boiling point (1749°C for pure lead) provides enormous thermal margin. Lead is also an effective neutron reflector and radiation shield. The challenges: lead is corrosive to steel at high temperatures (requiring specialized alloys or oxygen-controlled chemistry), extremely dense (logistics and seismic design), and opaque (complicating inspection). NewCleo and Dual Fluid pursue lead-cooled designs.",
    citations: [
      {
        bibtex_key: "oecd2015lfr_lead",
        author: "OECD Nuclear Energy Agency",
        title: "Handbook on Lead-bismuth Eutectic Alloy and Lead Properties",
        year: 2015,
        publisher: "OECD/NEA",
        url: "https://www.oecd-nea.org/jcms/pl_14972/handbook-on-lead-bismuth-eutectic-alloy-and-lead-properties",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "lead-bismuth",
    label: "Lead-Bismuth Eutectic",
    oneLineHook:
      "LBE — lower melting point than pure lead (~125°C vs 327°C). Soviet submarine legacy, expensive bismuth.",
    popoverBody:
      "Lead-bismuth eutectic (LBE, 44.5% Pb / 55.5% Bi by mass) has a melting point of ~125°C vs pure lead's 327°C, making reactor startup and shutdown far easier. The Soviet Union operated LBE-cooled reactors in its Alfa-class attack submarines for decades. LBE inherits lead's benefits (atmospheric pressure, no water reaction, high boiling point) while solving its startup problem. The catch: bismuth is expensive and its neutron activation produces polonium-210, a highly toxic and radioactive isotope that must be managed. Modern proposed designs balance LBE's operational advantages against that polonium burden.",
    citations: [
      {
        bibtex_key: "oecd2015lfr_lead-bismuth",
        author: "OECD Nuclear Energy Agency",
        title: "Handbook on Lead-bismuth Eutectic Alloy and Lead Properties",
        year: 2015,
        publisher: "OECD/NEA",
        url: "https://www.oecd-nea.org/jcms/pl_14972/handbook-on-lead-bismuth-eutectic-alloy-and-lead-properties",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "heat-pipes",
    label: "Heat pipes",
    oneLineHook:
      "Passive heat transport with no pumps — each pipe is a sealed, self-contained cooling circuit.",
    popoverBody:
      "Heat pipe reactors use sealed metal tubes containing a working fluid (typically sodium or potassium) that evaporates at the hot end (reactor core), travels as vapor to the cold end (heat exchanger), condenses, and wicks back by capillary action. No pumps, no moving parts, no external coolant loop. Each pipe operates independently, so a single pipe failure does not affect the others. This architecture is inherently walk-away-safe and well-suited to micro reactors for remote deployment. NASA's Kilopower/KRUSTY experiment demonstrated the concept in 2018.",
    citations: [
      {
        bibtex_key: "nasa2018krusty_heat-pipes",
        author: "NASA Glenn Research Center",
        title: "Kilopower: A Gateway to Abundant Power for Exploration",
        year: 2018,
        publisher: "NASA",
        url: "https://www.nasa.gov/directorates/stmd/tech-demo-missions-program/kilopower/",
        accessed: "2026-04-20",
      },
    ],
  },
];

// ─── X-FACTOR TAGS (unchanged from v1) ──────────────────────────────

const xFactorTags: ReadonlyArray<
  TaxonomyTag & { id: XFactorId; group: XFactorGroup }
> = [
  {
    id: "micro",
    label: "Micro",
    group: "scale",
    oneLineHook: "Under 20 MWe — transportable by truck, deployable to remote sites.",
    popoverBody:
      "Micro reactors produce less than 20 MWe and are designed to be factory-manufactured, transported as a complete unit, and operated with minimal on-site staff. Target applications include remote mining operations, military bases, disaster relief, and space propulsion. The small core size enables passive safety features that scale down more gracefully than active safety systems. Several designs (eVinci, KRUSTY, Project Pele) are in advanced development or testing.",
    citations: [
      {
        bibtex_key: "doe2023micro_micro",
        author: "U.S. Department of Energy",
        title: "What is a Micro Reactor?",
        year: 2023,
        publisher: "Office of Nuclear Energy",
        url: "https://www.energy.gov/ne/articles/what-micro-reactor",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "small",
    label: "Small",
    group: "scale",
    oneLineHook: "20–300 MWe — the SMR sweet spot: factory-built modules, shorter construction.",
    popoverBody:
      "Small modular reactors (SMRs) are defined by the IAEA as reactors with electrical output up to 300 MWe. The core proposition is factory fabrication of major components, reducing on-site construction time and cost uncertainty. Multiple modules can be co-located and added incrementally as demand grows. NuScale's VOYGR, GE Hitachi's BWRX-300, and X-energy's Xe-100 are among the leading SMR designs at various stages of licensing.",
    citations: [
      {
        bibtex_key: "iaea2024smr_small",
        author: "International Atomic Energy Agency",
        title: "Small Modular Reactors",
        year: 2024,
        publisher: "IAEA",
        url: "https://www.iaea.org/topics/small-modular-reactors",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "mid",
    label: "Mid",
    group: "scale",
    oneLineHook: "300–700 MWe — balancing unit economics with project risk.",
    popoverBody:
      "Mid-scale reactors occupy the space between SMRs and traditional large plants. They offer better unit economics than small reactors (more MWe per dollar of fixed cost) while keeping total project capital lower than gigawatt-class builds. Some designs in this range (like TerraPower's Natrium at 345 MWe) pair the reactor with thermal energy storage to provide flexible output that can ramp with grid demand.",
    citations: [
      {
        bibtex_key: "wna2024economics_mid",
        author: "World Nuclear Association",
        title: "Economics of Nuclear Power",
        year: 2024,
        publisher: "World Nuclear Association",
        url: "https://world-nuclear.org/information-library/economic-aspects/economics-of-nuclear-power",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "large",
    label: "Large",
    group: "scale",
    oneLineHook: "Over 700 MWe — maximum baseload output, but megaproject risk.",
    popoverBody:
      "Large reactors (>700 MWe, typically 1000–1400 MWe) deliver the lowest cost per MWh at steady-state operation due to economies of scale. The AP1000, EPR, and APR1400 are current-generation large designs. The challenge is megaproject execution: multi-year construction timelines, complex supply chains, and cost overruns. Vogtle Units 3 and 4 in Georgia (AP1000, 1117 MWe each) entered service in 2023–2024 after significant schedule and budget overruns, illustrating both the potential and the risk.",
    citations: [
      {
        bibtex_key: "eia2024vogtle_large",
        author: "U.S. Energy Information Administration",
        title: "Vogtle Nuclear Plant Expansion",
        year: 2024,
        publisher: "EIA",
        url: "https://www.eia.gov/todayinenergy/detail.php?id=61363",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "walk-away-safe",
    label: "Walk-Away-Safe",
    group: "capability",
    oneLineHook:
      "Passive safety that works without power, pumps, or human intervention — physics does the shutdown.",
    popoverBody:
      "Walk-away-safe designs rely on inherent physics (negative temperature coefficients, natural circulation, passive heat rejection) rather than active safety systems to reach a safe state after an accident. If all power is lost and all operators leave, the reactor shuts itself down and dissipates decay heat without fuel damage. This is a property of the coolant and fuel combination, not a bolt-on safety system. Designs using helium + TRISO, sodium + metal fuel, or heat pipes achieve this naturally. Pressurized light-water reactors require active safety systems to prevent fuel damage after a loss of coolant.",
    citations: [
      {
        bibtex_key: "nrc2024passivesafety_walk-away-safe",
        author: "U.S. Nuclear Regulatory Commission",
        title: "Passive Safety Systems in Advanced Reactor Designs",
        year: 2024,
        publisher: "NRC",
        url: "https://www.nrc.gov/reactors/new-reactors/advanced.html",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "load-following",
    label: "Load-Following",
    group: "capability",
    oneLineHook:
      "Can ramp output up and down to match grid demand — not just baseload.",
    popoverBody:
      "Load-following reactors adjust their power output in response to changing electricity demand, complementing variable renewables like solar and wind. While traditional nuclear plants CAN load-follow (France's fleet does it routinely), most designs optimize for steady baseload. Some advanced designs are specifically architected for flexible output: Natrium pairs a sodium fast reactor with a molten salt thermal storage system that decouples the reactor (steady) from the turbine (variable), enabling 150% peak output relative to the reactor's thermal capacity.",
    citations: [
      {
        bibtex_key: "oecd2019flex_load-following",
        author: "OECD Nuclear Energy Agency",
        title: "Technical and Economic Aspects of Load Following with Nuclear Power Plants",
        year: 2019,
        publisher: "OECD/NEA",
        url: "https://www.oecd-nea.org/jcms/pl_15000/technical-and-economic-aspects-of-load-following-with-nuclear-power-plants",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "process-heat",
    label: "Process Heat",
    group: "capability",
    oneLineHook:
      "Outlet temperatures high enough for industrial applications — hydrogen, steel, cement, desalination.",
    popoverBody:
      "Most industrial processes that currently burn fossil fuels need heat, not electricity. Reactors with outlet temperatures above 500°C can supply process heat directly: steam methane reforming for hydrogen (700–900°C), cement calcination (900°C), steel direct reduction (800–1000°C), and seawater desalination (100–200°C). High-temperature gas reactors (HTGRs) and molten salt reactors are the leading candidates. This is potentially nuclear energy's largest market — industrial heat accounts for roughly 50% of global final energy consumption.",
    citations: [
      {
        bibtex_key: "iaea2017processheat_process-heat",
        author: "International Atomic Energy Agency",
        title: "Industrial Applications of Nuclear Energy",
        year: 2017,
        publisher: "IAEA",
        url: "https://www.iaea.org/publications/10793/industrial-applications-of-nuclear-energy",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "thermal-storage",
    label: "Thermal Storage",
    group: "capability",
    oneLineHook:
      "Stores reactor heat in molten salt tanks — decouples generation from demand.",
    popoverBody:
      "Thermal energy storage (TES) systems capture heat from the reactor in an insulated medium (typically molten nitrate salt) and release it to drive turbines when electricity prices are high. The reactor operates at steady-state thermal output while the turbine ramps independently. TerraPower's Natrium design integrates a molten salt TES system that can boost electrical output from 345 MWe to 500 MWe for 5+ hours during peak demand. This makes nuclear dispatchable in the same way as natural gas peaker plants.",
    citations: [
      {
        bibtex_key: "terrapower2024natrium_thermal-storage",
        author: "TerraPower",
        title: "Natrium Technology",
        year: 2024,
        publisher: "TerraPower",
        url: "https://www.terrapower.com/our-work/natriumpower/",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "first-of-kind-licensed",
    label: "First-of-Kind Licensed",
    group: "capability",
    oneLineHook:
      "Has received or is in active NRC/regulatory review for construction or operation.",
    popoverBody:
      "A first-of-a-kind (FOAK) licensed reactor has passed through the regulatory review process that proves the design is safe enough to build and operate. In the US, this means NRC design certification or a combined construction and operating license (COL). Only a handful of advanced reactor designs have reached this milestone: NuScale's VOYGR received NRC design certification in 2023. The NRC is currently reviewing applications from X-energy (Xe-100), Kairos Power (KP-FHR), and others under various licensing pathways.",
    citations: [
      {
        bibtex_key: "nrc2024advreactors_first-of-kind-licensed",
        author: "U.S. Nuclear Regulatory Commission",
        title: "Advanced Reactors (non-LWR)",
        year: 2024,
        publisher: "NRC",
        url: "https://www.nrc.gov/reactors/new-reactors/advanced.html",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "fuel-breeder",
    label: "Fuel Breeder",
    group: "capability",
    oneLineHook:
      "Produces more fissile material than it consumes — multiplying fuel supply from fertile isotopes.",
    popoverBody:
      "A breeder reactor converts fertile material (U-238 or Th-232) into fissile material (Pu-239 or U-233) faster than it consumes fuel. This means a breeder can extract roughly 60x more energy from natural uranium than a conventional light-water reactor, dramatically extending fuel supply. Fast-spectrum reactors with sodium or lead coolant are the most common breeder designs. Breeding was demonstrated commercially at France's Superphénix and Russia's BN-600/BN-800, though economics and proliferation concerns have limited deployment.",
    citations: [
      {
        bibtex_key: "wna2024fastreactors_fuel-breeder",
        author: "World Nuclear Association",
        title: "Fast Neutron Reactors",
        year: 2024,
        publisher: "World Nuclear Association",
        url: "https://world-nuclear.org/information-library/current-and-future-generation/fast-neutron-reactors",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "waste-burner",
    label: "Waste Burner",
    group: "capability",
    oneLineHook:
      "Can fission long-lived actinides from spent fuel, reducing waste toxicity from millennia to centuries.",
    popoverBody:
      "Waste-burning reactors use fast neutrons to fission transuranic actinides (plutonium, americium, curium) that make spent nuclear fuel hazardous for hundreds of thousands of years. By transmuting these isotopes into shorter-lived fission products, the radiotoxicity of the remaining waste drops to natural uranium ore levels in ~300 years instead of ~300,000. Fast-spectrum sodium and lead reactors are the primary candidates. GE Hitachi's PRISM design was specifically proposed for actinide burning. The physics is proven; the infrastructure (reprocessing + fuel fabrication) is the bottleneck.",
    citations: [
      {
        bibtex_key: "anl2024transmutation_waste-burner",
        author: "Argonne National Laboratory",
        title: "Nuclear Fuel Recycling and Waste Transmutation",
        year: 2024,
        publisher: "ANL",
        url: "https://www.anl.gov/topic/nuclear-fuel-recycling",
        accessed: "2026-04-20",
      },
    ],
  },
  {
    id: "non-proliferative",
    label: "Non-Proliferative",
    group: "capability",
    oneLineHook:
      "Design features that make weapons-material diversion difficult or self-deterring.",
    popoverBody:
      "Non-proliferative reactor designs incorporate features that make diverting fissile material for weapons impractical: sealed cores with no on-site fuel handling (heat pipe micro reactors), fuel forms that are extremely difficult to reprocess (TRISO particles), fuel cycles that produce isotopes unsuitable for weapons (U-233 from thorium cycles contains U-232, a strong gamma emitter that complicates weapons fabrication), or enrichment levels below weapons-usable thresholds. No reactor design is perfectly proliferation-proof, but some architectures raise the barrier substantially.",
    citations: [
      {
        bibtex_key: "iaea2024safeguards_non-proliferative",
        author: "International Atomic Energy Agency",
        title: "IAEA Safeguards: Staying Ahead of the Game",
        year: 2024,
        publisher: "IAEA",
        url: "https://www.iaea.org/topics/safeguards-and-verification",
        accessed: "2026-04-20",
      },
    ],
  },
];

// ─── Export ──────────────────────────────────────────────────────────

export const reactorTaxonomy: ReactorTaxonomy = {
  fissileElementTags,
  kickstarterTags,
  fuelFormTags,
  coolantTags,
  xFactorTags,
};
