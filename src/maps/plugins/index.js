import { austriaPlugin } from './austria.js'
import { francePlugin } from './france.js'
import { trafficPlugin } from './traffic.js'
import { usaSectionalPlugin } from './usaSectional.js'

/** Chart overlays only — sorted by display label. */
const chartPlugins = [
  austriaPlugin,
  francePlugin,
  usaSectionalPlugin,
].sort((a, b) => a.label.localeCompare(b.label, 'en'))

/**
 * Registry of map overlays. To add a layer:
 * 1. Create `src/maps/plugins/yourPlugin.js` exporting a MapPlugin
 *    (with `priority` from LayerPriority; optional `start`/`stop` for dynamic data)
 * 2. Import it here — charts go in `chartPlugins` (auto-sorted by label);
 *    pin special layers (e.g. traffic) explicitly in `mapPlugins`
 *
 * Chart plugins that set `requiresLicense` stay hidden from Layers until the user
 * confirms provider approval in the Licensed charts panel.
 *
 * Educational plugin samples (not registered): `edu/dfs/`, `edu/dl-cz/`.
 */
export const mapPlugins = [trafficPlugin, ...chartPlugins]
