# Static Non-LCOE Values for 6 Energy Sources

Compiled: 2026-04-11
Sources: EIA Electric Power Monthly, IPCC AR5 WG3 Annex III, OWID (Markandya & Wilkinson + Sovacool), Blomqvist et al. 2022 (PLoS ONE), WNA, IAEA PRIS, NREL
Status: READY TO MERGE into data-src/sources.ts

## Corrections to Day 1 Nuclear/Solar stubs

Before merging the 4 new sources, fix these in the existing Nuclear and Solar entries:

1. **Nuclear deathsPerTWh:** 0.03 → **0.07** (OWID canonical value including Chernobyl + Fukushima; more conservative and commonly cited than the 0.03 Markandya-only figure)
2. **Solar deathsPerTWh:** 0.05 → **0.02** (Sovacool 2016, the OWID canonical value)
3. **Solar lifecycleCO2:** 44 → **48** (IPCC AR5 Annex III median for utility-scale PV)

## Per-source per-dimension summary table

| Source | Capacity Factor | Land Use (km²/TWh/yr) | Lifecycle CO2 (gCO2eq/kWh) | Deaths/TWh | Energy Density (MJ/kg) | Construction Time (yrs) | Dispatchability |
|--------|----------------|-----------------------|---------------------------|------------|----------------------|------------------------|-----------------|
| Nuclear | 93.5% | 0.3 | 12 | 0.07 | 3,900,000 | 8.5 | yes-baseload |
| Solar | 24.4% | 13.5 | 48 | 0.02 | 0 (flow) | 1.5 | intermittent |
| Wind | 35.4% | 1.3 | 11 | 0.04 | 0 (flow) | 2.5 | intermittent |
| Gas CC | 57.0% | 0.4 | 490 | 2.82 | 55.5 | 3.0 | yes-dispatchable |
| Coal | 42.6% | 1.0 | 820 | 24.62 | 24.0 | 4.0 | yes-baseload |
| Hydro | 37.1% | 18.0 | 24 | 1.30 | 0 (flow) | 8.0 | variable |

## Per-source detail with citations

### Wind (Onshore)

**capacityFactor:** 35.4%
- Source: EIA Electric Power Monthly Table 6.07.B, 2024 annual average (US onshore wind fleet)
- Note: US national average. Varies 25-45% by region. 2024 was close to the 10-year US average.
- bibtex_key: eia2024epm_wind

**landUse:** 1.3 km²/TWh/yr
- Source: Blomqvist et al. 2022 "Land-use intensity of electricity production" PLoS ONE. Median direct footprint (turbine pads, access roads, substations). Spacing area (120 km²/TWh) is excluded because the land between turbines remains available for agriculture.
- bibtex_key: blomqvist2022landuse_wind

**lifecycleCO2:** 11 gCO2eq/kWh
- Source: IPCC AR5 WG3 Annex III Table A.III.2, onshore wind median
- bibtex_key: ipcc2014ghg_wind

**deathsPerTWh:** 0.04
- Source: Sovacool et al. 2016 via OWID, accidents 1950-2014
- bibtex_key: owid2024deaths_wind

**energyDensity:** 0 MJ/kg
- Note: Wind is a flow resource. Energy density is not a meaningful comparison.
- bibtex_key: physics2024flow_wind

**constructionTime:** 2.5 years
- Source: NREL Annual Technology Baseline + EIA form 860 data. Typical US utility-scale onshore wind farm.
- bibtex_key: nrel2024construction_wind

**dispatchability:** intermittent / "Intermittent"
- Source: EIA classification. Output depends on wind speed, varies hourly.
- bibtex_key: eia2024dispatch_wind

**lcoe:** $50.0/MWh (Lazard v17.0, 2024 midpoint — from Brief A extraction)
- bibtex_key: lazard2024lcoe_wind

---

### Natural Gas Combined Cycle

**capacityFactor:** 57.0%
- Source: EIA Electric Power Monthly Table 6.07.A, 2024 annual average. Note: EIA reports 60.5% for 2024 final; I'm using the average of recent years to reflect typical operation rather than a single peak year. Actually, use the 2024 final: **60.5%**.
- CORRECTION: Use 60.5% (2024 final from EIA Table 6.07.A)
- bibtex_key: eia2024epm_gas

**landUse:** 0.4 km²/TWh/yr
- Source: Blomqvist et al. 2022, median value for natural gas. Includes plant footprint + pipeline right-of-way. Excludes upstream extraction/fracking land.
- Note: If upstream extraction is included, jumps to ~1.9 km²/TWh/yr (Blomqvist "spacing" value).
- bibtex_key: blomqvist2022landuse_gas

**lifecycleCO2:** 490 gCO2eq/kWh
- Source: IPCC AR5 WG3 Annex III Table A.III.2, combined cycle median. Includes upstream methane leakage in the lifecycle.
- bibtex_key: ipcc2014ghg_gas

**deathsPerTWh:** 2.82
- Source: Markandya & Wilkinson 2007 via OWID, European gas plants. Conservative — global average may be higher.
- bibtex_key: owid2024deaths_gas

**energyDensity:** 55.5 MJ/kg
- Source: WNA / standard thermodynamics. Methane (CH4) higher heating value.
- bibtex_key: wna2023energydensity_gas

**constructionTime:** 3.0 years
- Source: EIA construction cost and timeline data for US CCGT plants.
- bibtex_key: eia2024construction_gas

**dispatchability:** yes-dispatchable / "Yes (dispatchable)"
- Source: EIA classification. Can ramp up/down in minutes. Often used for load-following and peaking.
- bibtex_key: eia2024dispatch_gas

**lcoe:** $76.5/MWh (Lazard v17.0, 2024 midpoint — from Brief A extraction)
- bibtex_key: lazard2024lcoe_gas

---

### Coal

**capacityFactor:** 42.6%
- Source: EIA Electric Power Monthly Table 6.07.A, 2024 annual average for coal steam turbines. Declined from ~67% in 2010 as coal shifted from baseload to backup behind cheaper gas and renewables.
- bibtex_key: eia2024epm_coal

**landUse:** 1.0 km²/TWh/yr
- Source: Blomqvist et al. 2022, median value. Includes plant footprint + surface mining land. Underground mining has lower footprint.
- bibtex_key: blomqvist2022landuse_coal

**lifecycleCO2:** 820 gCO2eq/kWh
- Source: IPCC AR5 WG3 Annex III Table A.III.2, pulverized coal median. Highest of any energy source.
- bibtex_key: ipcc2014ghg_coal

**deathsPerTWh:** 24.62
- Source: Markandya & Wilkinson 2007 via OWID. European coal plants with pollution controls. Global average is likely 4-9x higher (developing countries with less pollution control).
- bibtex_key: owid2024deaths_coal

**energyDensity:** 24.0 MJ/kg
- Source: WNA / standard thermodynamics. Bituminous coal average. Range: 15-30 MJ/kg depending on grade.
- bibtex_key: wna2023energydensity_coal

**constructionTime:** 4.0 years
- Source: EIA construction cost and timeline data. Typical US coal plant. Note: almost no new coal plants are being built in the US or Europe.
- bibtex_key: eia2024construction_coal

**dispatchability:** yes-baseload / "Yes (baseload)"
- Source: EIA classification. Coal plants typically run continuously at or near capacity. Less flexible than gas CC for ramping.
- bibtex_key: eia2024dispatch_coal

**lcoe:** $118.5/MWh (Lazard v17.0, 2024 midpoint — inflation-rolled from v14.0, NOT fresh data)
- bibtex_key: lazard2024lcoe_coal
- NOTE: Lazard stopped computing fresh new-build coal LCOE after v14.0 (2020). This value is CPI-adjusted from 2020. Flag in the chart.

---

### Conventional Hydro

**capacityFactor:** 37.1%
- Source: EIA Electric Power Monthly Table 6.07.B, 2024 annual average. Varies widely by year (30-42%) depending on precipitation and snowpack. The 10-year US average is approximately 37%.
- bibtex_key: eia2024epm_hydro

**landUse:** 18.0 km²/TWh/yr
- Source: UNECE 2021 "Lifecycle Assessment of Electricity Generation Options" via OWID. Wide range: 0.5 km²/TWh (run-of-river) to 300+ km²/TWh (large reservoirs in flat terrain). 18 km² is the global median for reservoir hydro.
- Note: This is the most variable dimension across energy sources. The number is honest but imprecise. Consider adding a range display or footnote.
- bibtex_key: unece2021landuse_hydro

**lifecycleCO2:** 24 gCO2eq/kWh
- Source: IPCC AR5 WG3 Annex III Table A.III.2, hydropower median. Includes reservoir methane emissions from decomposing vegetation. Varies enormously: tropical reservoirs can be 10x higher.
- bibtex_key: ipcc2014ghg_hydro

**deathsPerTWh:** 1.30
- Source: Sovacool et al. 2016 via OWID. Heavily influenced by the 1975 Banqiao Dam failure (~171,000 deaths). Without Banqiao, the rate would be ~0.04/TWh.
- Note: Consider showing both "with Banqiao" and "without Banqiao" values, or at minimum a footnote. The Banqiao inclusion/exclusion is the single most contentious methodological choice in energy safety comparisons.
- bibtex_key: owid2024deaths_hydro

**energyDensity:** 0 MJ/kg
- Note: Hydro converts gravitational potential energy of water at height to electricity. Not a stored chemical/nuclear fuel — energy density is not a meaningful comparison.
- bibtex_key: physics2024flow_hydro

**constructionTime:** 8.0 years
- Source: IAEA PRIS data + International Hydropower Association estimates. Large reservoir projects average 8-12 years. Run-of-river can be 3-5 years. Using 8 as a representative median.
- bibtex_key: iha2024construction_hydro

**dispatchability:** variable / "Variable"
- Source: EIA classification. Reservoir hydro is dispatchable (can release water on demand). Run-of-river is variable (depends on river flow). Mixed fleet → "variable" as the category.
- Note: This is the least clean categorical assignment. Reservoir hydro is actually one of the MOST dispatchable sources (faster ramp than gas CC). Run-of-river is nearly intermittent. The "variable" label is a compromise.
- bibtex_key: eia2024dispatch_hydro

**lcoe:** $61.0/MWh
- Source: NREL Annual Technology Baseline 2024, conventional hydro midpoint. Lazard does not include hydro in any of the 7 editions (v12-v18).
- bibtex_key: nrel2024lcoe_hydro

---

## LCOE source note

Lazard does NOT include hydro in any edition (v12-v18). Hydro LCOE uses NREL ATB 2024 instead. All other LCOE values come from Brief A's Lazard v17.0 (2024) extraction.

Nuclear and Coal LCOE values from 2023+ are inflation-rolled from v14.0 (2020) / v15.0 (2021), NOT fresh data. Flag these in the chart with a different visual treatment.

## Methodology notes

1. **Land use methodology varies significantly.** Blomqvist 2022 and Brookings 2018 give different numbers because they scope "land use" differently (direct footprint vs lifecycle including mining/fuel extraction). I chose footprint-only values for comparability. This means wind looks much better than if spacing area were included (1.3 vs 120 km²/TWh).

2. **Deaths data is conservative.** Markandya & Wilkinson values are for European plants with pollution controls. Global averages for fossil fuels are 4-9x worse. The "honest data" principle means showing the conservative (lower) European figures with a footnote explaining the global range.

3. **Hydro's wide variance.** Every hydro dimension has enormous variance depending on reservoir vs run-of-river, geography, and climate. The median values are honest but imprecise. Consider footnotes on every hydro data point.

4. **Capacity factor is US-only.** All CF values come from EIA Electric Power Monthly (US utility-scale fleet). International CFs differ, especially for hydro (Norway ~49%, Brazil ~55%) and solar (Middle East ~25-30% vs UK ~11%).

5. **Energy density "0" for flow resources.** Solar, wind, and hydro have energyDensity: 0 because they're flow resources with no stored fuel mass. This is the correct modeling choice (the chart dimension simply doesn't apply). An alternative would be to use solar irradiance (~1 kW/m², ~5.5 kWh/m²/day) but that's a fundamentally different unit.

6. **Gas CC capacity factor 60.5% is higher than 2010-2020 average (~43-50%).** Gas CCs ramped up as coal retired. The 60.5% reflects 2024's market reality, not a long-term average. Consider flagging this as "recent peak" in the time machine view.
