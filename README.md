# VueloVista Mirador

Your lookout on the sky with VFR chart overlays on a selectable basemap (OSM, Carto Positron/Dark Matter, OpenTopoMap, Esri World Imagery), with pluggable live layers (traffic today; weather/radar later) and theme plugins for UI chrome. Charts sit opaque over the basemap so nothing shines through where coverage exists; outside chart bounds (and punched chart padding) the basemap remains visible.

One React + Leaflet codebase targets:

| Target | Shell |
|--------|--------|
| Web | Vite (`yarn dev` / `yarn start`) |
| iOS / Android | Capacitor |
| macOS / Windows / Linux | Tauri 2 |

Shared map plugins, themes, networking helpers, and a local-first SQLite data layer live under `src/`. Platform shells only handle packaging, permissions, and native SQLite/HTTP bridges.

## Map layer priorities

Map overlays are plugins with a numeric **priority** (higher draws on top). Bands leave room to insert new layer types later.

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

**Themes** (`src/themes/`) set panel colors, transparency, and blur via CSS variables. Map plugins may expose themable color keys (e.g. traffic aircraft fill) with fixed defaults; keys marked `themable: false` (emergency squawks) ignore theme overrides.

## Scripts

- `yarn dev` — Vite dev server (proxies DL.cz tiles, adsb.lol, adsbdb)
- `yarn build` — production web build → `dist/`
- `yarn start` — serve `dist` with the same proxies
- `yarn build:mobile` — `vite build` + `cap sync` (copy into iOS/Android projects)
- `yarn cap:ios` / `yarn cap:android` — open Xcode / Android Studio
- `yarn tauri:dev` — desktop app against Vite (requires [Rust](https://rustup.rs/))
- `yarn tauri:build` — packaged desktop binaries (requires Rust)

Use Node from [`.nvmrc`](.nvmrc) (e.g. `nvm use`).

Step-by-step build notes for web, iOS, Android, and desktop: **[docs/building.md](docs/building.md)**.

## Networking

Same-origin proxy paths (`/adsblol-proxy`, `/adsbdb-proxy`, `/standing-data-proxy`) are used in the browser. Vite and `scripts/serve.mjs` forward those to the upstream APIs.

On Capacitor and Tauri, [`src/net/http.js`](src/net/http.js) rewrites those paths to upstream hosts and attaches headers. Tauri uses a Rust `proxy_fetch` command with an allowlisted host set. Capacitor uses `CapacitorHttp`.

IGN France chart layers are registered but stay hidden until the user confirms provider approval/licence under **Licensed charts** in the controls panel. Educational DFS / DL.cz samples live under [`edu/`](edu/) and are not shipped.

## Local database

[`src/data/`](src/data/) is a local-first SQLite foundation (no cloud sync yet):

| Runtime | Engine |
|---------|--------|
| Web | `@sqlite.org/sqlite-wasm` (`JsStorageDb` / localStorage) |
| iOS / Android | `@capacitor-community/sqlite` |
| Desktop | `tauri-plugin-sql` |

Schema covers airports, runways, frequencies (for future ATC listen menus), navaids, airspaces, waypoints, track sessions/points, bookmarks, settings, and offline artifact metadata. Repositories are empty-query ready; seed imports (OurAirports / OpenAIP, etc.) are a follow-up.

`openDatabase()` runs on app start from [`src/main.jsx`](src/main.jsx).

## Mobile / desktop notes

- **Location:** iOS `Info.plist` and Android manifest include when-in-use location strings/permissions for ownship (and future track logging).
- **Desktop:** install Rust via rustup, then `yarn tauri:dev`. Replace placeholder icons under `src-tauri/icons/` with `yarn tauri icon path/to/app.png` when you have brand artwork.
- **Java / Android SDK:** needed only to build the Android project in Android Studio.

## License

Copyright 2026 VueloVista Initiative.

Licensed under the [Apache License, Version 2.0](LICENSE.md).

Third-party map data, charts, feeds, and libraries are listed in [CREDITS.md](CREDITS.md).
