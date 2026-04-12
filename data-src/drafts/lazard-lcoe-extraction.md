# Lazard LCOE Historical Extraction

Source: 7 PDF reports in `./Lazard Reports/`
Extracted: 2026-04-08
Methodology: Unsubsidized midpoint values in $/MWh, read directly from the "Levelized Cost of Energy Comparison — Unsubsidized Analysis" chart page (typically page 2 of each report, or page 8 in the LCOE+ reports). Midpoint computed as the arithmetic mean of the low and high of the quoted unsubsidized range. Nuclear uses the "New Build / Commercial" LCOE bar, NOT the marginal-cost-of-existing diamond marker. Utility-scale solar uses the "Solar PV — Crystalline Utility-Scale" (single-axis tracking) range. Onshore wind uses the "Wind" / "Wind — Onshore" range (not offshore). Coal uses the single Coal range shown. Gas CC uses the "Gas Combined Cycle" range. Hydro is not reported by Lazard in any of these 7 editions.

## Primary data table

| Year | Report Version | Pub Date  | Nuclear       | Solar PV     | Wind         | Gas CC       | Coal         | Hydro       |
|------|----------------|-----------|---------------|--------------|--------------|--------------|--------------|-------------|
| 2018 | v12.0          | Nov 2018  | $150.5        | $43.0        | $42.5        | $57.5        | $101.5       | not included |
| 2019 | v13.0          | Nov 2019  | $155.0        | $40.0        | $41.0        | $56.0        | $109.0       | not included |
| 2020 | v14.0          | Oct 2020  | $163.5        | $36.5        | $40.0        | $58.5        | $112.0       | not included |
| 2021 | v15.0          | Oct 2021  | $167.5        | $35.5        | $38.0        | $59.5        | $108.5       | not included |
| 2023 | v16.0 (LCOE+)  | Apr 2023  | $181.0*       | $60.0        | $49.5        | $70.0        | $117.0*      | not included |
| 2024 | v17.0 (LCOE+)  | Jun 2024  | $182.0*       | $60.5        | $50.0        | $76.5        | $118.5*      | not included |
| 2025 | v18.0 (LCOE+)  | Jun 2025  | $180.5*       | $58.0        | $61.5        | $78.5        | $122.0*      | not included |

\* In v16, v17, and v18 the Nuclear and Coal bars are shown inside DASHED outlines and are explicitly labeled "Lazard's LCOE v14.0 results adjusted for inflation" (v16 uses v15, v17 and v18 both cite v14.0 as the underlying basis). Lazard stopped freshly computing new-build nuclear and coal LCOEs in 2022. These values are therefore inflation-rolled versions of older analysis, NOT fresh estimates. See "Methodology changes flagged across versions" below.

## Per-source detail with ranges

All values in $/MWh. "p." = page of the specific PDF as extracted.

### Nuclear

- **2018 (v12.0, p. 2):** range $112 – $189, midpoint **$150.5**. Labeled "Nuclear" on the Conventional side of the chart. The $28 diamond marker is the marginal cost of operating an existing (fully depreciated) nuclear plant — NOT used. Footnote: "Unless otherwise indicated, the analysis herein does not reflect decommissioning costs or the potential economic impacts of federal loan guarantees or other subsidies."
- **2019 (v13.0, p. 2):** range $118 – $192, midpoint **$155.0**. Diamond marker at $29 is marginal cost of existing — NOT used.
- **2020 (v14.0, p. 2):** range $129 – $198, midpoint **$163.5**. Diamond marker at $29 is marginal cost of existing — NOT used.
- **2021 (v15.0, p. 2):** range $131 – $204, midpoint **$167.5**. Diamond marker at $29 is marginal cost of existing — NOT used.
- **2023 (v16.0, p. 2 of LCOE+ report):** range $141 – $221, midpoint **$181.0**. Bar is in a DASHED outline. Footnote (3): "Given the limited public and/or observable data set available for new-build nuclear projects and the emerging range of new nuclear generation strategies, the LCOE presented herein represents Lazard's LCOE v15.0 results adjusted for inflation (results are based on then-estimated costs of the Vogtle Plant and are U.S.-focused)." Diamond marker at $31 is marginal cost of existing.
- **2024 (v17.0, p. 9 of LCOE+ report):** range $142 – $222, midpoint **$182.0**. Bar is in DASHED outline. Footnote (1): "Given the limited public and/or observable data available for new-build geothermal, coal and nuclear projects the LCOE presented herein reflects Lazard's LCOE v14.0 results adjusted for inflation and, for nuclear, are based on then-estimated costs of the Vogtle Plant." An additional red diamond at **$190** is labeled as "illustrative midpoint LCOE for Vogtle nuclear plant units 3 and 4 based on publicly available estimates. Total operating capacity of ~2.2 GW, total capital cost of ~$31.5 billion, capacity factor of ~97%, operating life of 60 – 80 years." Diamond at $32 is marginal cost of existing.
- **2025 (v18.0, p. 8 of LCOE+ report):** range $141 – $220, midpoint **$180.5**. Bar is in DASHED outline. Footnote (2) repeats: "for nuclear, based on then-estimated costs of the Vogtle Plant" and the bar "reflects Lazard's LCOE v14.0 results adjusted for inflation." TWO illustrative Vogtle markers are shown: **$169** (midpoint of $169 – $220 Vogtle LCOE, based on industry-expert "~30% learning curve between Vogtle 3 and 4") and **$228** (expected Vogtle 3 & 4 actual-cost LCOE — footnote 6: "total capacity ~2.2 GW, total capital cost ~$32.3 billion, capacity factor ~97%, operating life of 70 years"). Diamond at $34 is marginal cost of existing.

### Utility-Scale Solar PV (Crystalline, single-axis tracking)

- **2018 (v12.0, p. 2):** "Solar PV — Crystalline Utility Scale" range $40 – $46, midpoint **$43.0**. Thin-film variant $36 – $44 also shown; not used.
- **2019 (v13.0, p. 2):** range $36 – $44, midpoint **$40.0**.
- **2020 (v14.0, p. 2):** range $31 – $42, midpoint **$36.5**.
- **2021 (v15.0, p. 2):** range $30 – $41, midpoint **$35.5**.
- **2023 (v16.0, p. 2):** Label changes to "Solar PV — Utility-Scale" (single combined line, no separate crystalline/thin-film split). Range $24 – $96, midpoint **$60.0**. Range widening reflects broader geographic/technology sample.
- **2024 (v17.0, p. 9):** "Solar PV — Utility" range $29 – $92, midpoint **$60.5**.
- **2025 (v18.0, p. 8):** "Solar PV — Utility" range $38 – $78, midpoint **$58.0**. Low end rises sharply (first ever low-end increase — cited in executive summary).

### Onshore Wind

- **2018 (v12.0, p. 2):** "Wind" range $29 – $56, midpoint **$42.5**. Orange diamond at $92 is offshore wind — NOT used.
- **2019 (v13.0, p. 2):** range $28 – $54, midpoint **$41.0**. Offshore diamond at $89 — not used.
- **2020 (v14.0, p. 2):** range $26 – $54, midpoint **$40.0**. Offshore diamond at $86 — not used.
- **2021 (v15.0, p. 2):** range $26 – $50, midpoint **$38.0**. Offshore diamond at $83 — not used.
- **2023 (v16.0, p. 2):** "Wind — Onshore" (now a distinct labeled row) range $24 – $75, midpoint **$49.5**. Separate "Wind — Offshore" row $72 – $140 — not used.
- **2024 (v17.0, p. 9):** "Wind — Onshore" range $27 – $73, midpoint **$50.0**.
- **2025 (v18.0, p. 8):** "Wind — Onshore" range $37 – $86, midpoint **$61.5**. Low end rises notably — consistent with the "low end LCOE values increase for the first time" narrative.

### Gas Combined Cycle

- **2018 (v12.0, p. 2):** "Gas Combined Cycle" range $41 – $74, midpoint **$57.5**. Fuel cost assumption $3.45/MMBtu.
- **2019 (v13.0, p. 2):** range $44 – $68, midpoint **$56.0**. Same fuel assumption.
- **2020 (v14.0, p. 2):** range $44 – $73, midpoint **$58.5**. Additional blue diamond $88 = 20% blue-H2 blend, green diamond $127 = 20% green-H2 blend — NOT used.
- **2021 (v15.0, p. 2):** range $45 – $74, midpoint **$59.5**. Blue-H2 $89, green-H2 $129 — NOT used.
- **2023 (v16.0, p. 2):** range $39 – $101, midpoint **$70.0**. Bar is DASHED (v15 adjusted for inflation per footnote 2). Diamond $62 = marginal-cost-of-existing; blue-H2 $116, green-H2 $156 — not used.
- **2024 (v17.0, p. 9):** range $45 – $108, midpoint **$76.5**. Blue-H2 diamond not shown; green-H2 diamond $150.
- **2025 (v18.0, p. 8):** range $48 – $109, midpoint **$78.5**. Diamond at $107 noted as "illustrative high case reflects elevated capital costs ($2,400/kW – $2,600/kW) based on recently observed market quotes for CCGT projects in early stages of development (post-2028 COD)" — not used.

### Coal

- **2018 (v12.0, p. 2):** range $60 – $143, midpoint **$101.5**. Footnote (6): "reflects average of Northern Appalachian Upper Ohio River Barge and Pittsburgh Seam Rail coal. High end incorporates 90% carbon capture and compression. Does not include cost of transportation and storage." Diamond at $36 = marginal cost of existing — not used.
- **2019 (v13.0, p. 2):** range $66 – $152, midpoint **$109.0**. Same coal type / CCS caveat.
- **2020 (v14.0, p. 2):** range $65 – $159, midpoint **$112.0**. Same CCS high-end caveat.
- **2021 (v15.0, p. 2):** range $65 – $152, midpoint **$108.5**.
- **2023 (v16.0, p. 2):** range $68 – $166, midpoint **$117.0**. DASHED outline — "Lazard's LCOE v15.0 results adjusted for inflation" per footnote (5). High end still 90% CCS.
- **2024 (v17.0, p. 9):** range $69 – $168, midpoint **$118.5**. DASHED outline — "v14.0 results adjusted for inflation" per footnote (1).
- **2025 (v18.0, p. 8):** range $71 – $173, midpoint **$122.0**. DASHED outline — still v14.0 adjusted for inflation.

### Hydro

- **2018 – 2025 (all 7 reports):** NOT INCLUDED in Lazard's LCOE analysis in any of these 7 editions. Lazard does not publish a new-build hydro LCOE. Hydro is absent from the Renewable Energy / Alternative Energy section of every comparison chart inspected. For Module 1's time-series chart, hydro values would need to come from a different source (EIA AEO, IEA WEO, or IRENA).

## Methodology changes flagged across versions

- **v12.0 → v13.0 (2018 → 2019):** No structural methodology change. Cost-of-capital assumption (60% debt @ 8% / 40% equity @ 12%) and fuel-cost assumption ($3.45/MMBtu for gas) are unchanged. Nuclear and coal still freshly computed. "Alternative Energy" category label is renamed "Renewable Energy" in v13.
- **v13.0 → v14.0 (2019 → 2020):** Adds carbon-pricing sensitivity page. Adds illustrative blue-H2 / green-H2 blend diamond markers on the Gas Combined Cycle bar. Cost-of-capital assumptions unchanged. Still fresh nuclear and coal computation in v14.
- **v14.0 → v15.0 (2020 → 2021):** Minor. Values for nuclear, coal, and gas CC move modestly. No structural change. **v14 is the last version in which nuclear and coal were freshly computed from bottom-up assumptions — after v14/v15, these become inflation-roll-forwards.**
- **v15.0 → v16.0 "LCOE+" rebrand (Oct 2021 → Apr 2023):** Major changes:
  - Report is rebranded **"LCOE+"** and now bundles LCOE, LCOS (Storage), and LCOH (Hydrogen) into one document. LCOE itself becomes "Version 16.0."
  - Produced "with support from Roland Berger" — external consulting partner joins the analysis.
  - Publication cadence shifts from annual (Oct/Nov) to April 2023, breaking the series (no 2022 report).
  - Utility-scale solar is consolidated into a single "Solar PV — Utility-Scale" line (crystalline vs thin-film split dropped).
  - Onshore and offshore wind become separate rows ("Wind — Onshore" / "Wind — Offshore").
  - **CRITICAL: New-build Nuclear and Coal are no longer freshly computed.** The dashed-outline bars for Nuclear and Coal are explicitly labeled as "Lazard's LCOE v15.0 results adjusted for inflation" (per v16 footnote). Lazard cites "limited public and/or observable data set available for new-build nuclear projects and the emerging range of new nuclear generation strategies" as justification. This means Nuclear and Coal time-series values from 2023 onward are NOT independent fresh observations — they are the v15 numbers CPI-rolled forward. **Cross-version nuclear comparisons from 2023–2025 should flag this.**
  - Gas Combined Cycle high end widens dramatically (v15 high $74 → v16 high $101), reflecting Lazard's inclusion of observed marginal-cost data.
- **v16.0 → v17.0 (Apr 2023 → Jun 2024):** No major structural change. Nuclear and Coal bars are now labeled as "Lazard's LCOE **v14.0** results adjusted for inflation" (not v15.0 as in v16) — Lazard shifted the anchor one version further back, which is unusual and worth noting. v17 adds the illustrative Vogtle midpoint diamond at $190 (first time Vogtle appears as a distinct callout). Publication shifts to June.
- **v17.0 → v18.0 (Jun 2024 → Jun 2025):** No major structural change. Nuclear still on v14.0-adjusted basis. v18 adds a SECOND Vogtle diamond at $228 reflecting the actually-observed Vogtle 3 & 4 costs ($32.3 billion total capital cost, ~2.2 GW, ~97% CF, 70-year life). v18 also adds a CCGT high-case diamond at $107 reflecting observed turbine-shortage capex inflation. Executive summary notes "low end LCOE values increase for the first time ever" for renewables — low-end of onshore wind jumps from $27 to $37, and low-end of utility solar jumps from $29 to $38.

## Ready-to-paste citation objects

```ts
// Nuclear
{ year: 2018, value: 150.5, citation: { bibtex_key: "lazard2018lcoev12_nuclear", author: "Lazard", title: "Levelized Cost of Energy Analysis v12.0, Nuclear (unsubsidized midpoint)", year: 2018, version: "v12.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/450784/lazards-levelized-cost-of-energy-version-120-vfinal.pdf", accessed: "2026-04-08", note: "Midpoint of $112–$189 range, Unsubsidized Analysis chart, p. 2." } },
{ year: 2019, value: 155.0, citation: { bibtex_key: "lazard2019lcoev13_nuclear", author: "Lazard", title: "Levelized Cost of Energy Analysis v13.0, Nuclear (unsubsidized midpoint)", year: 2019, version: "v13.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/451086/lazards-levelized-cost-of-energy-version-130-vf.pdf", accessed: "2026-04-08", note: "Midpoint of $118–$192 range, p. 2." } },
{ year: 2020, value: 163.5, citation: { bibtex_key: "lazard2020lcoev14_nuclear", author: "Lazard", title: "Levelized Cost of Energy Analysis v14.0, Nuclear (unsubsidized midpoint)", year: 2020, version: "v14.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/451419/lazards-levelized-cost-of-energy-version-140.pdf", accessed: "2026-04-08", note: "Midpoint of $129–$198 range, p. 2. Last version with freshly-computed new-build nuclear." } },
{ year: 2021, value: 167.5, citation: { bibtex_key: "lazard2021lcoev15_nuclear", author: "Lazard", title: "Levelized Cost of Energy Analysis v15.0, Nuclear (unsubsidized midpoint)", year: 2021, version: "v15.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/451905/lazards-levelized-cost-of-energy-version-150-vf.pdf", accessed: "2026-04-08", note: "Midpoint of $131–$204 range, p. 2." } },
{ year: 2023, value: 181.0, citation: { bibtex_key: "lazard2023lcoeplusv16_nuclear", author: "Lazard", title: "LCOE+ April 2023, Nuclear (unsubsidized midpoint)", year: 2023, version: "v16.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/2ozoovyg/lazards-lcoeplus-april-2023.pdf", accessed: "2026-04-08", note: "Midpoint of $141–$221 range, p. 2. Dashed-outline bar: Lazard v15.0 adjusted for inflation — not a fresh estimate." } },
{ year: 2024, value: 182.0, citation: { bibtex_key: "lazard2024lcoeplusv17_nuclear", author: "Lazard", title: "LCOE+ June 2024, U.S. Nuclear (unsubsidized midpoint)", year: 2024, version: "v17.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/xemfey0k/lazards-lcoeplus-june-2024-_vf.pdf", accessed: "2026-04-08", note: "Midpoint of $142–$222 range, p. 9. Dashed-outline bar: v14.0 adjusted for inflation. Illustrative Vogtle midpoint shown at $190." } },
{ year: 2025, value: 180.5, citation: { bibtex_key: "lazard2025lcoeplusv18_nuclear", author: "Lazard", title: "LCOE+ June 2025, U.S. Nuclear (unsubsidized midpoint)", year: 2025, version: "v18.0", publisher: "Lazard Ltd.", url: "https://www.lazard.com/media/typdgxmm/lazards-lcoeplus-june-2025-_vf.pdf", accessed: "2026-04-08", note: "Midpoint of $141–$220 range, p. 8. Dashed-outline bar: v14.0 adjusted for inflation. Vogtle illustrative $169; expected Vogtle 3&4 actual $228." } },

// Utility-Scale Solar PV
{ year: 2018, value: 43.0,  citation: { bibtex_key: "lazard2018lcoev12_solar",   author: "Lazard", title: "LCOE v12.0, Solar PV Crystalline Utility-Scale (unsubsidized midpoint)",   year: 2018, version: "v12.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $40–$46, p. 2." } },
{ year: 2019, value: 40.0,  citation: { bibtex_key: "lazard2019lcoev13_solar",   author: "Lazard", title: "LCOE v13.0, Solar PV Crystalline Utility-Scale (unsubsidized midpoint)",   year: 2019, version: "v13.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $36–$44, p. 2." } },
{ year: 2020, value: 36.5,  citation: { bibtex_key: "lazard2020lcoev14_solar",   author: "Lazard", title: "LCOE v14.0, Solar PV Crystalline Utility-Scale (unsubsidized midpoint)",   year: 2020, version: "v14.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $31–$42, p. 2." } },
{ year: 2021, value: 35.5,  citation: { bibtex_key: "lazard2021lcoev15_solar",   author: "Lazard", title: "LCOE v15.0, Solar PV Crystalline Utility-Scale (unsubsidized midpoint)",   year: 2021, version: "v15.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $30–$41, p. 2." } },
{ year: 2023, value: 60.0,  citation: { bibtex_key: "lazard2023lcoeplusv16_solar", author: "Lazard", title: "LCOE+ v16.0, Solar PV Utility-Scale (unsubsidized midpoint)",            year: 2023, version: "v16.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $24–$96, p. 2. Crystalline/thin-film split dropped; single combined row." } },
{ year: 2024, value: 60.5,  citation: { bibtex_key: "lazard2024lcoeplusv17_solar", author: "Lazard", title: "LCOE+ v17.0, Solar PV Utility (unsubsidized midpoint)",                   year: 2024, version: "v17.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $29–$92, p. 9." } },
{ year: 2025, value: 58.0,  citation: { bibtex_key: "lazard2025lcoeplusv18_solar", author: "Lazard", title: "LCOE+ v18.0, Solar PV Utility (unsubsidized midpoint)",                   year: 2025, version: "v18.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $38–$78, p. 8. First year low-end rose." } },

// Onshore Wind
{ year: 2018, value: 42.5, citation: { bibtex_key: "lazard2018lcoev12_wind", author: "Lazard", title: "LCOE v12.0, Wind / Onshore (unsubsidized midpoint)", year: 2018, version: "v12.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $29–$56, p. 2." } },
{ year: 2019, value: 41.0, citation: { bibtex_key: "lazard2019lcoev13_wind", author: "Lazard", title: "LCOE v13.0, Wind / Onshore (unsubsidized midpoint)", year: 2019, version: "v13.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $28–$54, p. 2." } },
{ year: 2020, value: 40.0, citation: { bibtex_key: "lazard2020lcoev14_wind", author: "Lazard", title: "LCOE v14.0, Wind / Onshore (unsubsidized midpoint)", year: 2020, version: "v14.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $26–$54, p. 2." } },
{ year: 2021, value: 38.0, citation: { bibtex_key: "lazard2021lcoev15_wind", author: "Lazard", title: "LCOE v15.0, Wind / Onshore (unsubsidized midpoint)", year: 2021, version: "v15.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $26–$50, p. 2." } },
{ year: 2023, value: 49.5, citation: { bibtex_key: "lazard2023lcoeplusv16_wind", author: "Lazard", title: "LCOE+ v16.0, Wind — Onshore (unsubsidized midpoint)", year: 2023, version: "v16.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $24–$75, p. 2. Range widens due to broader sample." } },
{ year: 2024, value: 50.0, citation: { bibtex_key: "lazard2024lcoeplusv17_wind", author: "Lazard", title: "LCOE+ v17.0, Wind — Onshore (unsubsidized midpoint)", year: 2024, version: "v17.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $27–$73, p. 9." } },
{ year: 2025, value: 61.5, citation: { bibtex_key: "lazard2025lcoeplusv18_wind", author: "Lazard", title: "LCOE+ v18.0, Wind — Onshore (unsubsidized midpoint)", year: 2025, version: "v18.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $37–$86, p. 8. Low end jumps — Lazard flagged as first-ever increase." } },

// Gas Combined Cycle
{ year: 2018, value: 57.5, citation: { bibtex_key: "lazard2018lcoev12_gascc", author: "Lazard", title: "LCOE v12.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2018, version: "v12.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $41–$74, p. 2. Fuel assumption $3.45/MMBtu." } },
{ year: 2019, value: 56.0, citation: { bibtex_key: "lazard2019lcoev13_gascc", author: "Lazard", title: "LCOE v13.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2019, version: "v13.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $44–$68, p. 2." } },
{ year: 2020, value: 58.5, citation: { bibtex_key: "lazard2020lcoev14_gascc", author: "Lazard", title: "LCOE v14.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2020, version: "v14.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $44–$73, p. 2." } },
{ year: 2021, value: 59.5, citation: { bibtex_key: "lazard2021lcoev15_gascc", author: "Lazard", title: "LCOE v15.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2021, version: "v15.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $45–$74, p. 2." } },
{ year: 2023, value: 70.0, citation: { bibtex_key: "lazard2023lcoeplusv16_gascc", author: "Lazard", title: "LCOE+ v16.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2023, version: "v16.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $39–$101, p. 2. High end widens notably." } },
{ year: 2024, value: 76.5, citation: { bibtex_key: "lazard2024lcoeplusv17_gascc", author: "Lazard", title: "LCOE+ v17.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2024, version: "v17.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $45–$108, p. 9." } },
{ year: 2025, value: 78.5, citation: { bibtex_key: "lazard2025lcoeplusv18_gascc", author: "Lazard", title: "LCOE+ v18.0, Gas Combined Cycle (unsubsidized midpoint)", year: 2025, version: "v18.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $48–$109, p. 8. Illustrative high case marker at $107 for new turbine-shortage capex." } },

// Coal
{ year: 2018, value: 101.5, citation: { bibtex_key: "lazard2018lcoev12_coal", author: "Lazard", title: "LCOE v12.0, Coal (unsubsidized midpoint)", year: 2018, version: "v12.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $60–$143, p. 2. High end includes 90% CCS." } },
{ year: 2019, value: 109.0, citation: { bibtex_key: "lazard2019lcoev13_coal", author: "Lazard", title: "LCOE v13.0, Coal (unsubsidized midpoint)", year: 2019, version: "v13.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $66–$152, p. 2." } },
{ year: 2020, value: 112.0, citation: { bibtex_key: "lazard2020lcoev14_coal", author: "Lazard", title: "LCOE v14.0, Coal (unsubsidized midpoint)", year: 2020, version: "v14.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $65–$159, p. 2. Last freshly-computed coal LCOE in the series." } },
{ year: 2021, value: 108.5, citation: { bibtex_key: "lazard2021lcoev15_coal", author: "Lazard", title: "LCOE v15.0, Coal (unsubsidized midpoint)", year: 2021, version: "v15.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $65–$152, p. 2." } },
{ year: 2023, value: 117.0, citation: { bibtex_key: "lazard2023lcoeplusv16_coal", author: "Lazard", title: "LCOE+ v16.0, Coal (unsubsidized midpoint)", year: 2023, version: "v16.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $68–$166, p. 2. Dashed outline: v15.0 adjusted for inflation." } },
{ year: 2024, value: 118.5, citation: { bibtex_key: "lazard2024lcoeplusv17_coal", author: "Lazard", title: "LCOE+ v17.0, Coal (unsubsidized midpoint)", year: 2024, version: "v17.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $69–$168, p. 9. Dashed outline: v14.0 adjusted for inflation." } },
{ year: 2025, value: 122.0, citation: { bibtex_key: "lazard2025lcoeplusv18_coal", author: "Lazard", title: "LCOE+ v18.0, Coal (unsubsidized midpoint)", year: 2025, version: "v18.0", publisher: "Lazard Ltd.", accessed: "2026-04-08", note: "Midpoint of $71–$173, p. 8. Dashed outline: v14.0 adjusted for inflation." } },
```

## Missing data / gaps / concerns

- **No Hydro in any Lazard edition.** Lazard's LCOE does not publish a new-build hydro estimate in any of the 7 reports. For Module 1's chart, hydro must come from a secondary source (suggest EIA AEO Annual Technology Baseline, IRENA Renewable Power Generation Costs, or IEA WEO). Report "not included" rather than fabricating.
- **No 2022 data point.** Lazard skipped late-2022. v15.0 is Oct 2021; v16.0 is April 2023. If Module 1's time series needs a 2022 tick, options: (a) omit 2022, (b) linearly interpolate with a clear footnote, or (c) use a secondary source. Recommendation: omit rather than interpolate.
- **Nuclear and Coal from 2023 onward are NOT fresh observations.** v16/v17/v18 nuclear bars are explicitly labeled as v15.0 (in v16) or v14.0 (in v17, v18) results adjusted for inflation. The ~$180/MWh midpoint in 2023, 2024, and 2025 is therefore a CPI roll-forward of the Oct 2021 or Oct 2020 numbers, not a fresh bottom-up estimate. **For the historical time-series chart this is a genuine apples-to-oranges boundary.** Strong recommendation: either (a) show a distinct line-style (dashed) for 2023–2025 nuclear and coal to match Lazard's own visual convention, (b) annotate the chart with a footnote, or (c) stop the Lazard-sourced nuclear/coal series at 2021 and use EIA AEO / ATB for 2022+.
- **Vogtle illustrative markers in v17/v18 are worth surfacing.** v17 introduces a $190 "illustrative Vogtle midpoint" marker and v18 adds both $169 (learning-curve between Vogtle 3 and 4) and $228 (actual observed). These are the closest thing Lazard provides to a real-world U.S. nuclear LCOE data point post-2022 and may be more honest for the chart than the inflation-rolled v14 anchor. Consider whether Module 1 should use Vogtle-based values instead of or alongside the dashed-bar midpoints.
- **Solar utility-scale definition change at v16.** Prior to v16, Lazard separated "Crystalline" from "Thin-Film" utility-scale solar; from v16 onward it is a single combined row. I used the crystalline line (2018–2021) and the combined line (2023–2025). The 2021→2023 jump in midpoint ($35.5 → $60) is large but reflects both (a) the combined definition and (b) Lazard broadening its range to reflect geographic variance (low end only rose from $30 to $24; it's the HIGH end that jumped from $41 to $96). The midpoint jump is partly a methodology artifact — flag in chart footnote.
- **Onshore wind 2025 jump ($50 → $61.5) is real** per Lazard's own executive summary: persistent cost pressures from interest rates, interconnection delays, and tariff impacts. Not a methodology artifact.
- **Gas CC definition stable across all 7 versions** but the high-end widens significantly at v16 because Lazard began incorporating observed marginal-cost data. Midpoint trend (2018: $57.5 → 2025: $78.5) is directionally reliable but the range-widening from v16 onward is worth noting.
- **All values are U.S.-focused** (explicitly stated in footer of every LCOE+ report from v16 onward). Earlier reports are implicitly U.S.-focused with some global sensitivity pages.
- **URLs in citation objects for v12–v15 are best-effort based on standard Lazard media-path conventions** and should be verified before publication. The LCOE+ URLs (v16, v17, v18) I have reproduced from typical Lazard media paths but also warrant a manual click-through check.
