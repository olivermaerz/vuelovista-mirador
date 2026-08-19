/**
 * @typedef {Object} PluginLayerContext
 * @property {string} pane Leaflet pane name for this plugin's priority
 */

/**
 * @typedef {Object} PluginLifecycleCtx
 * @property {import('leaflet').Map} map
 * @property {import('leaflet').Layer} layer
 * @property {string} pane
 */

/**
 * Chart layers that need explicit user confirmation of provider approval/licence
 * before they appear in the Layers list.
 *
 * @typedef {Object} ChartLicenseGate
 * @property {string} provider Provider name shown in the confirm dialog
 * @property {string} summary Short explanation of why confirmation is required
 * @property {boolean} [requiresApiKey] When true, dialog must collect a provider API key
 * @property {string} [apiKeyLabel] Input label for the API key field
 * @property {string} [apiKeyHelp] Short hint under the API key field
 */

/**
 * @typedef {Object} MapPlugin
 * @property {string} id Unique key used for toggle state
 * @property {string} label Toggle button label
 * @property {boolean} defaultActive Whether the layer starts visible
 * @property {number} priority Stacking order from LayerPriority bands (higher = on top)
 * @property {string} [group] UI group hint: 'charts' | 'weather' | 'traffic'
 * @property {string} [licenseTermsUrl]
 *   Provider terms / licence page shown in the activation dialog when `requiresLicense` is set.
 * @property {ChartLicenseGate} [requiresLicense]
 *   When set, the layer stays hidden until the user confirms they hold approval/licence.
 * @property {Record<string, import('../themes/types.js').PluginColorDef>} [colors]
 *   Named colors with defaults. Keys marked `themable: false` ignore theme overrides
 *   (e.g. emergency squawks). Themable keys may be restyled by ThemePlugin.pluginColors.
 * @property {(map: import('leaflet').Map, ctx: PluginLayerContext) => import('leaflet').Layer} createLayer
 *   Factory that returns a Leaflet layer (XYZ, WMS, LayerGroup, …)
 * @property {(ctx: PluginLifecycleCtx) => void} [start]
 *   Called when the layer is toggled on (or starts active). Use for pollers.
 * @property {(ctx: PluginLifecycleCtx) => void} [stop]
 *   Called when the layer is toggled off or the map is destroyed.
 */

export {}
