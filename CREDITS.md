# Credits

VueloVista Mirador uses third-party map data, aeronautical charts, live feeds, and open-source software. Active layers are also attributed in the map footer. Keep this file in sync with `src/credits.js`.

## Basemaps

- [OpenStreetMap](https://www.openstreetmap.org/copyright) — Map data © OpenStreetMap contributors
- [OpenTopoMap](https://opentopomap.org) — Style © OpenTopoMap (CC-BY-SA); SRTM via viewfinderpanoramas.org

## Aeronautical charts

- [IGN / SIA](https://www.geoportail.gouv.fr/donnees/carte-oaci-vfr) — OACI-VFR France (opt-in; user enters their own IGN API key)
- [Austro Control](https://maps.austrocontrol.at/mapstore/#/viewer/121) — VFR Online Austria (WMS)
- [FAA Aeronautical Information Services](https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/vfr/) — US VFR Sectional charts

Archived educational integrations (not shipped): see [`edu/`](edu/) — includes approval-gated DFS (`edu/dfs/`) and API-key DL.cz (`edu/dl-cz/`) chart plugin examples.

## Live traffic & aircraft data

- [adsb.lol](https://adsb.lol) — ADS-B traffic feed (ODbL)
- [Virtual Radar Server standing data](https://github.com/vradarserver/standing-data) — Callsign route lookups (via adsb.lol mirror)
- [adsbdb](https://adsbdb.com) — Aircraft registration / type database (not routes)

## Software

- [React](https://react.dev)
- [Leaflet](https://leafletjs.com) — Map engine
- [Vite](https://vite.dev) — Build tooling
- [Capacitor](https://capacitorjs.com) — iOS / Android shells
- [Tauri](https://tauri.app) — Desktop shells
- [SQLite](https://sqlite.org) — Local-first reference / user data (`@sqlite.org/sqlite-wasm`, `@capacitor-community/sqlite`, `tauri-plugin-sql`)

## Aeronautical reference data (planned)

Seed imports for airports, navaids, and airspaces are not shipped yet. When added, list the upstream datasets and licenses here (e.g. OurAirports, OpenAIP, national AIP extracts).
