// Seasonal outlook shown in the banner. Set `source` once one is chosen.
export const EL_NINO: { text: string; source: { label: string; url: string } | null } = {
  text: '2026–27 Super El Niño: above-normal heat expected through January.',
  source: null,
}

// Listed in the footer
export const SOURCES = [
  { name: 'Open-Meteo', url: 'https://open-meteo.com', what: '7-day temperature forecast' },
  { name: 'NASA POWER', url: 'https://power.larc.nasa.gov', what: 'daily max temperature, 1981–present' },
  { name: 'ZIMSTAT 2022 census', url: 'https://www.citypopulation.de/en/zimbabwe/admin/', what: 'district population' },
  { name: 'HDX COD-AB', url: 'https://data.humdata.org/dataset/cod-ab-zwe', what: 'district boundaries' },
  { name: 'World Bank', url: 'https://data.worldbank.org/indicator/SP.DYN.CBRT.IN?locations=ZW', what: 'crude birth rate' },
]

export const GITHUB_URL = 'https://github.com/RuvaS20/emberly'
