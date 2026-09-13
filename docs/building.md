# Building Mirador

One React + Leaflet app under `src/`. Capacitor wraps the Vite `dist/` build for iOS and Android. `yarn dev` is the same UI in a browser.

Use the Node version in [`.nvmrc`](../.nvmrc) (`nvm use`), then `yarn install` once at the repo root.

## Web (dev)

| Goal | Command |
|------|---------|
| Dev (hot reload + proxies) | `yarn dev` |
| Production assets | `yarn build` |
| Serve `dist/` with tile/ADSB proxies | `yarn start` |

Output: `dist/`. No native toolchain required. This is how you iterate on the UI; the phone apps load that same build.

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

## Quick reference

| Platform | Build / sync | Open / run |
|----------|----------------|------------|
| Web (dev) | `yarn build` | `yarn start` or host `dist/` |
| iOS | `yarn build:mobile` | `yarn cap:ios` → Xcode Run |
| Android | `yarn build:mobile` | `yarn cap:android` → Android Studio Run |

Shared app code never forks per OS. Platform-specific pieces are Capacitor/`ios`/`android` and the adapters in `src/platform`, `src/net`, and `src/data/adapters`.
