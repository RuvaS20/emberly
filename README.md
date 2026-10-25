# Emberly

A heat early-warning dashboard for Zimbabwe's maternity care. It turns a 7-day weather
forecast into a per-district pregnancy risk level, estimates how many extra preterm births
to expect, and records a fingerprint of each day's alert on a blockchain so the published
figures can be checked later.

> Estimates are modelled from population-level studies. They are not predictions for any
> person or clinic, and Emberly is not medical advice.

---

## Who it's for

| | |
| --- | --- |
| **Main users** | District health officers and maternity clinics, through the dashboard. |
| **Secondary users** | Midwives and community health workers, through the alert log. |
| **Scope** | Zimbabwe's districts only for now. The configuration is designed to extend to any African location later. |

---

## How it works

```text
Open-Meteo forecast ─┐
NASA POWER history ──┼─→  pipeline  ─→  alerts/<date>.json  ─→  FastAPI  ─→  React dashboard
ZIMSTAT population ──┘        │                 │
HDX boundaries ───────────────┘                 └─→  SHA-256 ─→ Ethereum Sepolia
```

1. **Classify.** Each district's forecast daily maximum temperature is compared with
   preterm-birth heat thresholds. A district is raised one level when the forecast reaches
   its *own* historical 95th percentile, so a cool highland district still gets a warning
   on a day that is unusual for it.
2. **Estimate.** Extra preterm births = population × crude birth rate × preterm share ×
   the added risk for that level.
3. **Anchor.** The day's alert file is hashed with SHA-256 and the hash is written to a
   contract on Ethereum Sepolia. Anyone can re-hash the file and compare.

### Risk levels

| Level | Daily max (Tmax) | Added preterm risk |
| --- | --- | --- |
| Normal | < 30.05 °C | 0% |
| Caution | 30.05 – 33.34 °C | +5% |
| High | 33.34 – 38.64 °C | +10% |
| Extreme | ≥ 38.64 °C | +20% |

Thresholds from Heil et al. 2026 (preterm birth). Defined once in
`backend/pipeline/classify.py` and mirrored in `frontend/src/levels.ts`.

---

## Directory structure

```text
emberly/
├── backend/
│   ├── api/main.py              FastAPI app: alerts, districts, history, verify
│   ├── pipeline/                one script per step, run in order
│   │   ├── districts.py           boundaries + centroids from the HDX shapefile
│   │   ├── population.py          2022 census population per district
│   │   ├── history.py             NASA POWER daily Tmax since 1981 → p95, hot-day counts
│   │   ├── monthly.py             monthly national averages + anomalies
│   │   ├── classify.py            the risk levels and thresholds
│   │   ├── estimate.py            the extra-preterm-births model
│   │   ├── forecast.py            fetches the forecast, writes the day's alert file
│   │   ├── chain.py               hashing and contract reads
│   │   ├── anchor.py              writes the day's hash on-chain
│   │   └── tamper_test.py         makes an altered copy, to demo verification
│   └── data/                    generated data and the published alerts
├── contracts/
│   ├── HeatAlertRegistry.sol    append-only date → hash registry
│   └── abi.json
└── frontend/src/
    ├── App.tsx                  routes only
    ├── api.ts, levels.ts, config.ts
    ├── styles/                  tokens.css (all colours, fonts, spacing), base.css
    ├── layout/                  Header (banner, brand, nav), Footer
    ├── pages/                   DashboardPage, VerifyPage
    ├── ui/                      Card, Tooltip, SourceNote, PlotFigure, ErrorBoundary
    ├── features/
    │   ├── map/                   MapPanel, MapView, DaySlider, RiskLegend, useDistrictMap
    │   ├── district/              DistrictPanel, RiskBadge, TempForecastChart, …
    │   └── verify/                VerifyForm, VerifyResult, FingerprintCompare
    └── charts/                  one folder per chart, each with its own CSS module
        ├── AlertsScatter/         districts by baseline vs forecast peak
        ├── HeatTileMap/           a tile per district, sized by estimated impact
        ├── MonthlyTempBars/       monthly, seasonal and annual averages since 1981
        ├── DistrictDial/          hot days per district, 1980s vs now
        └── EvidenceInfographic/   the published research behind the thresholds
```

Every component keeps its styles in a CSS module beside it. Shared values — colours, the
risk levels, fonts, spacing — live only in `frontend/src/styles/tokens.css`.

---

## Features

#### Dashboard

- Choropleth map of all 91 districts, with a 7-day slider and a click-through detail panel.
- Per-district panel: risk badge, 7-day temperature chart, estimated extra preterm births
  with an upper bound, and the day's alert fingerprint.
- Five charts, all driven by the API or generated data rather than hard-coded numbers.

#### Verify

- Upload an alert file, or pick a published date, and check it against the chain.
- The two fingerprints are revealed character by character, with mismatches flashed in red.

#### Pipeline

- NASA POWER responses are cached per district, so re-runs are instant.
- `forecast.py` refuses to overwrite a file that has already been anchored.
- `anchor.py` refuses to anchor twice, and warns if the file changed after anchoring.

---

## Running it

Requires Python 3 and Node. Create `.env` in the repo root for the chain steps:

```ini
RPC_URL=https://sepolia.infura.io/v3/<key>
CONTRACT_ADDRESS=0x…
PRIVATE_KEY=0x…          # a throwaway testnet key, never a real one
```

**Build the data** (run from the repo root, in this order — each step feeds the next):

```bash
python backend/pipeline/districts.py     # needs the HDX shapefile unzipped first
python backend/pipeline/population.py
python backend/pipeline/history.py       # slow on the first run: 91 API calls
python backend/pipeline/monthly.py
python backend/pipeline/forecast.py      # writes backend/data/alerts/<today>.json
python backend/pipeline/anchor.py        # writes the hash on-chain
```

**Run the app** (two terminals):

```bash
uvicorn backend.api.main:app --reload    # API on :8000
cd frontend && npm install && npm run dev # app on :5173
```

`npm run build` type-checks and builds; `npm run lint` runs Oxlint.

### API

| Endpoint | Returns |
| --- | --- |
| `GET /alerts` | every published alert date |
| `GET /alerts/{date}` | the alert, its fingerprint and its anchor record |
| `GET /districts` | district boundaries as GeoJSON |
| `GET /history` | yearly hot-day counts per district |
| `GET /verify/{date}` | checks the stored file against the chain |
| `POST /verify` | checks an uploaded file against the chain |

---

## Data sources

| Source | Used for |
| --- | --- |
| [Open-Meteo](https://open-meteo.com) | 7-day forecast temperatures |
| [NASA POWER](https://power.larc.nasa.gov) | daily max temperature, 1981–present |
| [ZIMSTAT 2022 census](https://www.citypopulation.de/en/zimbabwe/admin/) | district population |
| [HDX COD-AB](https://data.humdata.org/dataset/cod-ab-zwe) | district boundaries |
| [World Bank](https://data.worldbank.org/indicator/SP.DYN.CBRT.IN?locations=ZW) | crude birth rate |

Research behind the model: Heil et al. 2026 (thresholds), Blencowe et al. 2012 (preterm
share) and Lakhoo et al. 2025 (upper sensitivity). See [References](#references) for the
full list and [Background](#background) for the case behind the project.

---

## What the blockchain does and does not prove

The contract stores one `date → hash` record, writable only by the deploying account and
only once per date. That proves **a file with this exact content existed at this time and
has not been edited since**. It does not prove the forecast was accurate or the estimates
correct. It currently runs on **Sepolia, a test network**, which has no economic security
and can in principle be reset — so today it demonstrates the mechanism rather than
providing a durable public record.

See `TODO.md` for planned work.

---

## Background

*A blockchain-anchored early warning dashboard for heat-induced maternal and neonatal
risks in Zimbabwe.*

### The climate threat and geographic inequity

The global climate crisis is rapidly accelerating into an immediate public health
emergency. Currently, a record-strength El Niño is building, with key Pacific temperature
anomalies forecast to peak near +3.7 °C in December 2026 — more than a full degree above
the devastating 2015–2016 record. This unprecedented heat poses a severe, localized threat
to sub-Saharan Africa.

Despite the severity of this impending crisis, a massive geographic disparity persists in
climate-health data: only **3%** of global research on heat and pregnancy originates from
low-income countries, compared to **63%** from high-income and temperate nations (Lakhoo
et al., 2025). Recognizing this dangerous blind spot, the WHO, WMO, UNICEF and UNFPA
recently launched the first global indicators for tracking extreme heat's toll on mothers
and newborns, emphasizing a fundamental public health reality: **health systems cannot
adequately respond to what they do not count.**

### Physiological and epidemiological vulnerability

Pregnant individuals and their fetuses are exceptionally vulnerable to extreme ambient
temperatures. Real-world field studies of pregnant workers in West Africa demonstrate that
maternal heat strain forces blood to be diverted from the placenta to the skin for
thermoregulation, resulting in acute fetal distress, altered fetal heart rates and
restricted blood flow (Bonell et al., 2022).

Epidemiologically, these physiological strains translate into devastating clinical
outcomes. Across lower-to-middle-income countries — including data encompassing Zimbabwe —
exposure to maximum temperatures (Tmax) above 20 °C, and particularly those surpassing
30 °C, acts as an immediate trigger for preterm birth within a 0-to-1-day window (McElroy
et al., 2022).

The risks associated with extreme heat are staggering:

| Finding | Effect | Source |
| --- | --- | --- |
| Preterm birth during heatwaves | +26% risk | Lakhoo et al., 2025 |
| Preterm birth, low-income vs high-income settings | OR = 1.61 | Lakhoo et al., 2025 |
| Perinatal mortality, extreme heat in the week before delivery | +34% | Hanson et al., 2024 |
| Intrapartum stillbirth (death during labour) | +64% | Hanson et al., 2024 |
| Mortality in children under five, African climate zones | up to +27% | Brimicombe et al., 2024 |

These climate-driven threats extend beyond birth, exacerbating underlying regional
vulnerabilities well into early childhood.

### Proposed solution: an auditable early warning dashboard

To bridge the gap between global data deficiencies and the urgent need for localized
climate-health adaptation, this project proposes a web dashboard tailored for Zimbabwe's
district health officers and maternity clinics. The dashboard continuously monitors local
weather forecasts and cross-references them against newly established, peer-reviewed
heat-health thresholds — integrating preterm-birth risk triggers based on Tmax: a 5% risk
increase at 30.05 °C, 10% at 33.34 °C and 20% at 38.64 °C (Heil et al., 2026).

When a forecast breaches these evidence-based thresholds, the dashboard issues automated,
localized alerts. Crucially, it translates meteorological data into actionable clinical
intelligence by estimating the specific number of extra preterm births to expect, allowing
resource-constrained maternity wards to proactively mobilize staff, hydration protocols
and cooling interventions.

Finally, to address the WHO mandate for reliable tracking, every issued alert and its
corresponding epidemiological estimate is anchored onto a blockchain. This creates a
transparent, auditable data trail. By ensuring the data can be trusted by local
ministries, international aid agencies and climate researchers, the dashboard not only
acts as an early warning system but also establishes a verifiable foundation for future
climate-health financing and policy in the Global South.

---

## References

1. Bonell, A., Sonko, B., Badjie, J., Samateh, T., Saidy, T., Sosseh, F., Sallah, Y.,
   Bajo, K., Murray, K. A., Hirst, J., Vicedo-Cabrera, A., Prentice, A. M., Maxwell, N.
   S., & Haines, A. (2022). Environmental heat stress on maternal physiology and fetal
   blood flow in pregnant subsistence farmers in The Gambia, west Africa: an observational
   cohort study. *The Lancet Planetary Health*, 6(12), e968–e976.
2. Brimicombe, C., Wieser, K., Monthaler, T., Jackson, D., De Bont, J., Chersich, M. F.,
   et al. (2024). Effects of ambient heat exposure on risk of all-cause mortality in
   children younger than 5 years in Africa: a pooled time-series analysis. *The Lancet
   Planetary Health*, 8(9), e640–e646.
3. Hanson, C., de Bont, J., Annerstedt, K. S., Alsina, M. d. R., Nobile, F., Roos, N.,
   Waiswa, P., Pembe, A., Dossou, J.-P., Chipeta, E., Benova, L., Kidanto, H., Part, C.,
   Stafoggia, M., Filippi, V., & Ljungman, P. (2024). A time-stratified, case–crossover
   study of heat exposure and perinatal mortality from 16 hospitals in sub-Saharan Africa.
   *Nature Medicine*, 30, 3106–3113.
4. Heil, C. S., Ioannou, L. G., Alce, G., Frennert, S., & Gao, C. (2026). A systematic
   review and meta-analysis on heat thresholds for maternal health and birth outcomes.
   *Nature Communications*, 17(8768).
5. Lakhoo, D. P., Brink, N., Radebe, L., Craig, M. H., Pham, M. D., Haghighi, M. M., Wise,
   A., Solarin, I., Luchters, S., Maimela, G., Chersich, M. F., Heat-Health Study Group, &
   HIGH Horizons Study Group. (2025). A systematic review and meta-analysis of heat
   exposure impacts on maternal, fetal and neonatal health. *Nature Medicine*, 31,
   684–694.
6. McElroy, S., Ilango, S., Dimitrova, A., Gershunov, A., & Benmarhnia, T. (2022). Extreme
   heat, preterm birth, and stillbirth: A global analysis across 14 lower-middle income
   countries. *Environment International*, 158, 106902.
