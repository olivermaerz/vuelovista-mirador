# Educational example: licensed chart plugin (DFS Germany)

This folder is a **tutorial sample**, not a shipped Mirador layer. It shows how to
build a map plugin that:

1. Declares `requiresLicense` (approval gate, no API key)
2. Links provider terms via `licenseTermsUrl`
3. Stays hidden from **Layers** until the user confirms under **Licensed charts**
4. Loads public XYZ tiles once activated

The live app does **not** import this plugin. Use it as a template for
approval-gated chart providers, or enable it locally only if you have written
permission from [DFS](https://www.dfs.de/) to use their chart tiles.

## Files

| File | Role |
|------|------|
| `dfsPlugin.js` | Copy to `src/maps/plugins/dfs.js` |

## Enable the example locally

### 1. Register the plugin

```bash
cp edu/dfs/dfsPlugin.js src/maps/plugins/dfs.js
```

In `src/maps/plugins/index.js`:

```js
import { dfsPlugin } from './dfs.js'
// add dfsPlugin to the chartPlugins array
```

### 2. Use it

**Licensed charts** → enable **DFS Germany VFR** → turn the layer on under
**Layers**.

If you distribute a build with this plugin, update `CREDITS.md` / `src/credits.js`.

## Pattern to reuse for another approval-only layer

- Set `licenseTermsUrl` and `requiresLicense: { provider, summary }` (omit
  `requiresApiKey`)
- No proxy needed when tiles are publicly reachable CORS/XYZ endpoints
- Keep the plugin out of the default registry until you have provider approval
