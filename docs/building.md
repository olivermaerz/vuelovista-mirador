# Building Mirador for each platform

One React + Leaflet app under `src/`. Shells wrap the Vite `dist/` build (or the Vite dev server for desktop/web iteration).

Use the Node version in [`.nvmrc`](../.nvmrc) (`nvm use`), then `yarn install` once at the repo root.

## Web

| Goal | Command |
|------|---------|
| Dev (hot reload + proxies) | `yarn dev` |
| Production assets | `yarn build` |
| Serve `dist/` with tile/ADSB proxies | `yarn start` |

Output: `dist/`. No native toolchain required.

Proxies (`/adsblol-proxy`, `/adsbdb-proxy`, `/standing-data-proxy`) are provided by Vite in dev/preview and by `scripts/serve.mjs` for `yarn start`. Optional edu samples (e.g. DL.cz) document their own proxy wiring under `edu/`.

## iOS (Capacitor)

**Needs:** macOS, Xcode, CocoaPods (as required by the Capacitor iOS project), Apple developer signing for device/App Store.

```bash
yarn build:mobile   # vite build && npx cap sync
yarn cap:ios        # open Xcode
```

In Xcode: select a simulator or device, set your Team under Signing, then Run.

Location permission strings live in `ios/App/App/Info.plist`. After web changes, always re-run `yarn build:mobile` (or `yarn build && npx cap sync`) before testing in Xcode.

**Build note:** Capacitor 8.5’s SPM XCFramework does not yet export `SceneDelegateProxy`. Our `SceneDelegate.swift` forwards URL / universal-link events through `ApplicationDelegateProxy` instead so Xcode can compile. Revisit when a Capacitor SPM build includes `SceneDelegateProxy`.

## Android (Capacitor)

**Needs:** Android Studio, JDK, Android SDK.

```bash
yarn build:mobile
yarn cap:android    # open Android Studio
```

In Android Studio: sync Gradle if prompted, pick an emulator or device, Run.

Location permissions are in `android/app/src/main/AndroidManifest.xml`. Same sync rule as iOS: rebuild/sync after frontend changes.

## Desktop — macOS, Windows, Linux (Tauri 2)

**Needs:** [Rust](https://rustup.rs/) (`rustc`, `cargo`), platform C/C++ build tools (Xcode CLT on macOS; MSVC Build Tools on Windows; usual GTK/WebKit deps on Linux — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)).

| Goal | Command |
|------|---------|
| Dev (starts Vite + native window) | `yarn tauri:dev` |
| Release installers / binaries | `yarn tauri:build` |

Rust project: `src-tauri/`. Frontend dist is configured in `src-tauri/tauri.conf.json` (`frontendDist: ../dist`, `devUrl: http://localhost:5173`).

Packaged apps use the Tauri `proxy_fetch` command (allowlisted hosts) instead of the Node proxy. Replace placeholder icons under `src-tauri/icons/` with:

```bash
yarn tauri icon path/to/app-icon.png
```

## Quick reference

| Platform | Build / sync | Open / run |
|----------|----------------|------------|
| Web | `yarn build` | `yarn start` or host `dist/` |
| iOS | `yarn build:mobile` | `yarn cap:ios` → Xcode Run |
| Android | `yarn build:mobile` | `yarn cap:android` → Android Studio Run |
| Desktop | `yarn tauri:build` | installers under `src-tauri/target/release/bundle/` |

Shared app code never forks per OS. Platform-specific pieces are Capacitor/`ios`/`android`, `src-tauri`, and the adapters in `src/platform`, `src/net`, and `src/data/adapters`.
