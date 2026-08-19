/**
 * @typedef {Object} ThemeUi
 * CSS custom-property values for chrome (panels, controls, type).
 * @property {string} font
 * @property {string} panelBg          e.g. rgba(255,255,255,0.82)
 * @property {string} panelBorder
 * @property {string} panelText
 * @property {string} panelTextMuted
 * @property {string} accent
 * @property {string} accentText
 * @property {string} accentBorder
 * @property {string} controlBg
 * @property {string} controlBorder
 * @property {string} controlText
 * @property {string} controlHover
 * @property {string} shadow
 * @property {string} radius
 * @property {string} blur             backdrop-filter blur, e.g. '10px'
 */

/**
 * Plugin color key: default fill + whether themes may override it.
 * Non-themable keys (e.g. emergency squawks) always keep the plugin default.
 * Use default `'accent'` to follow ThemeUi.accent when no theme override is set.
 *
 * @typedef {Object} PluginColorDef
 * @property {string} default  CSS color, or `'accent'` for theme accent
 * @property {boolean} [themable]  default true when omitted
 */

/**
 * @typedef {Object} ThemePlugin
 * @property {string} id
 * @property {string} label
 * @property {boolean} [defaultActive]
 * @property {ThemeUi} ui
 * @property {Record<string, Record<string, string>>} [pluginColors]
 *   Optional overrides: pluginColors[mapPluginId][colorKey] = css color.
 *   Only applied when the map plugin marks that key themable.
 */

export {}
