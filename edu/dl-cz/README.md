# Educational example: API-key chart plugin (DL.cz)

This folder is a **tutorial sample**, not a shipped Mirador layer. It shows how to
build a map plugin that:

1. Declares `requiresLicense` + `requiresApiKey`
2. Collects the key in the **Licensed charts** activation dialog
3. Attaches the key on each tile request (`X-AUTH-TOKEN` for DL.cz)
4. Uses `TransparentJpegLayer` with punched chart padding

The live app does **not** import this plugin or the DL proxy. Use it as a
template for licensed providers, or enable it locally after you have written
permission from [Databáze letišť](https://www.dl.cz/).

## Files

| File | Role |
|------|------|
| `czechPlugin.js` | Copy to `src/maps/plugins/czech.js` |
| `dlProxy.config.js` | Optional web/native proxy (forwards the user’s `X-AUTH-TOKEN`; no secret) |

## Enable the example locally

### 1. Register the plugin

```bash
cp edu/dl-cz/czechPlugin.js src/maps/plugins/czech.js
```

In `src/maps/plugins/index.js`:

```js
import { czechPlugin } from './czech.js'
// add czechPlugin to the chartPlugins array
```

### 2. Wire the proxy (web + production serve)

In `vite.config.js`, import and spread `dlViteProxy` from
`./edu/dl-cz/dlProxy.config.js` into `server.proxy` and `preview.proxy`.

In `scripts/serve.mjs`, import `DL_PROXY_PREFIX` / `DL_UPSTREAM` from
`../edu/dl-cz/dlProxy.config.js` and add a handler that forwards
`req.headers['x-auth-token']` as `X-AUTH-TOKEN` to upstream (same pattern as
the Vite `configure` hook).

In `src/net/routes.js`, add a route entry:

```js
import { DL_PROXY_PREFIX, DL_UPSTREAM } from '../../edu/dl-cz/dlProxy.config.js'
// ROUTES: { kind: 'dl', prefix: DL_PROXY_PREFIX, upstream: DL_UPSTREAM, headers: {} }
```

In `src-tauri/src/lib.rs` `host_allowed`, allow `www.dl.cz`.

### 3. Use it

**Licensed charts** → enable **DL.cz Czechia VFR** → paste your key → turn the
layer on under **Layers**.

If you distribute a build with this plugin, update `CREDITS.md` / `src/credits.js`.

## Pattern to reuse for another API-key layer

- Set `licenseTermsUrl` and `requiresLicense: { requiresApiKey: true, apiKeyLabel, apiKeyHelp, … }`
- Read the key with `getChartApiKey(pluginId)` from `src/maps/licensedCharts.js`
- Pass it as a query param (like IGN France) or via `fetchHeaders` on
  `TransparentJpegLayer` (like this example)
- Keep proxy config and secrets out of the default app; never commit a real provider token
