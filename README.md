# VueloVista Mirador

Check out the air traffic in the sky. Live ADS-B on a map, plus VFR charts for USA and Austria over a basemap you pick (OSM, Carto Positron/Dark Matter, OpenTopoMap, Esri World Imagery). Weather and other overlays fill in situational awareness.

One React + Leaflet app, shipped as iOS and Android via Capacitor. `yarn dev` is the same UI in a browser while you work.

Map plugins, themes, networking, and a local SQLite layer live under `src/`. The native projects just do packaging, permissions, and native SQLite/HTTP.

## Screenshot

<a href="assets/screenshot.png"><img src="assets/screenshot.png" alt="App screenshot" width="480"/></a>

_Thumbnail preview — click to view full size (assets/screenshot.png)._

## Map layer priorities

Overlays are plugins with a numeric **priority** (higher draws on top). Bands leave room to slot new layer types in later.

| Band | Value | Use |
|------|-------|-----|
| BASE | 100 | selectable basemap |
| CHART | 200 | VFR/ICAO chart tiles |
| AIRSPACE | 250 | airspace polygons (later) |
| WEATHER | 300 | weather overlays (later) |
| RADAR | 400 | radar imagery (later) |
| NAVAID | 450 | navaids / fixes (later) |
| AIRPORT | 480 | airport markers (later) |
| TRAFFIC | 500 | ADS-B / live aircraft |
| TRACK | 550 | recorded track (later) |
| OWNSHIP | 600 | “you are here” marker |

**Themes** (`src/themes/`) set panel colors, transparency, and blur via CSS variables. Map plugins can expose themable color keys (e.g. traffic aircraft fill) with fixed defaults; keys marked `the...`

## Scripts

- `yarn dev` — Vite dev server (proxies DL.cz tiles, adsb.lol, adsbdb)
- `yarn build` — production web build → `dist/`
- `yarn start` — serve `dist` with the same proxies
- `yarn build:mobile` — `vite build` + `cap sync` (copy into iOS/Android projects)
- `yarn cap:ios` / `yarn cap:android` — open Xcode / Android Studio

Use Node from [`.nvmrc`](.nvmrc) (`nvm use`).

How to actually build and install iOS and Android: **[docs/building.md](docs/building.md)**.

## Networking

In the browser, same-origin proxy paths (`/adsblol-proxy`, `/adsbdb-proxy`, `/standing-data-proxy`) keep the APIs off the page origin. Vite and `scripts/serve.mjs` forward those upstream.

On Capacitor, [`src/net/http.js`](src/net/http.js) rewrites those paths to the real hosts and attaches headers via `CapacitorHttp`.

IGN France chart layers are registered but stay hidden until you confirm provider approval/licence under **Licensed charts** in the controls panel. Educational DFS / DL.cz samples live under [`edu...`]

## Local database

[`src/data/`](src/data/) is SQLite on the device. No cloud sync yet.

| Runtime | Engine |
|---------|--------|
| Web (dev) | `@sqlite.org/sqlite-wasm` (`JsStorageDb` / localStorage) |
| iOS / Android | `@capacitor-community/sqlite` |

Schema covers airports, runways, frequencies (for future ATC listen menus), navaids, airspaces, waypoints, track sessions/points, bookmarks, settings, and offline artifact metadata. Repositories q...

`openDatabase()` runs on app start from [`src/main.jsx`](src/main.jsx).

## Mobile notes

- **Location:** iOS `Info.plist` and the Android manifest have when-in-use location strings for ownship (and later track logging).
- **Java / Android SDK:** only needed to build the Android project in Android Studio.

## License

Copyright 2026 Oliver Maerz.

Licensed under the [MIT License](LICENSE.md).

Third-party map data, charts, feeds, and libraries are listed in [CREDITS.md](CREDITS.md).
