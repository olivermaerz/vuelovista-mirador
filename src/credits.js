/**
 * Third-party credits for the About → Credits UI.
 * Keep in sync with CREDITS.md (see .cursor/rules/credits.mdc).
 *
 * @typedef {{ name: string, url?: string, note?: string }} CreditItem
 * @typedef {{ id: string, title: string, items: CreditItem[] }} CreditSection
 */

/** @type {CreditSection[]} */
export const creditSections = [
  {
    id: 'basemaps',
    title: 'Basemaps',
    items: [
      {
        name: 'OpenStreetMap',
        url: 'https://www.openstreetmap.org/copyright',
        note: 'Map data © OpenStreetMap contributors',
      },
      {
        name: 'OpenTopoMap',
        url: 'https://opentopomap.org',
        note: 'Style © OpenTopoMap (CC-BY-SA); SRTM via viewfinderpanoramas.org',
      },
    ],
  },
  {
    id: 'charts',
    title: 'Aeronautical charts',
    items: [
      {
        name: 'IGN / SIA',
        url: 'https://www.geoportail.gouv.fr/donnees/carte-oaci-vfr',
        note: 'OACI-VFR France (opt-in; user enters their own IGN API key)',
      },
      {
        name: 'Austro Control',
        url: 'https://maps.austrocontrol.at/mapstore/#/viewer/121',
        note: 'VFR Online Austria (WMS)',
      },
      {
        name: 'FAA Aeronautical Information Services',
        url: 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/vfr/',
        note: 'US VFR Sectional charts',
      },
    ],
  },
  {
    id: 'traffic',
    title: 'Live traffic & aircraft data',
    items: [
      {
        name: 'adsb.lol',
        url: 'https://adsb.lol',
        note: 'ADS-B traffic feed (ODbL)',
      },
      {
        name: 'Virtual Radar Server standing data',
        url: 'https://github.com/vradarserver/standing-data',
        note: 'Callsign route lookups (via adsb.lol mirror)',
      },
      {
        name: 'adsbdb',
        url: 'https://adsbdb.com',
        note: 'Aircraft registration / type database (not routes)',
      },
    ],
  },
  {
    id: 'software',
    title: 'Software',
    items: [
      {
        name: 'React',
        url: 'https://react.dev',
      },
      {
        name: 'Leaflet',
        url: 'https://leafletjs.com',
        note: 'Map engine',
      },
      {
        name: 'Vite',
        url: 'https://vite.dev',
        note: 'Build tooling',
      },
      {
        name: 'Capacitor',
        url: 'https://capacitorjs.com',
        note: 'iOS / Android shells',
      },
      {
        name: 'SQLite',
        url: 'https://sqlite.org',
        note: 'Local-first reference / user data',
      },
    ],
  },
]
