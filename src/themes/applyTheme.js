/** @type {Record<keyof import('./types.js').ThemeUi, string>} */
const UI_VAR = {
  font: '--theme-font',
  panelBg: '--theme-panel-bg',
  panelBorder: '--theme-panel-border',
  panelText: '--theme-panel-text',
  panelTextMuted: '--theme-panel-text-muted',
  accent: '--theme-accent',
  accentText: '--theme-accent-text',
  accentBorder: '--theme-accent-border',
  controlBg: '--theme-control-bg',
  controlBorder: '--theme-control-border',
  controlText: '--theme-control-text',
  controlHover: '--theme-control-hover',
  shadow: '--theme-shadow',
  radius: '--theme-radius',
  blur: '--theme-blur',
}

/**
 * Apply a theme's UI tokens as CSS variables on the document root.
 * @param {import('./types.js').ThemePlugin} theme
 * @param {HTMLElement} [el]
 */
export const applyTheme = (theme, el = document.documentElement) => {
  el.dataset.theme = theme.id
  for (const [key, cssVar] of Object.entries(UI_VAR)) {
    const value = theme.ui[/** @type {keyof import('./types.js').ThemeUi} */ (key)]
    if (value != null) el.style.setProperty(cssVar, value)
  }
}

/**
 * Resolve a map-plugin color: theme override (if themable) else plugin default.
 *
 * @param {import('./types.js').ThemePlugin | null | undefined} theme
 * @param {string} pluginId
 * @param {string} colorKey
 * @param {Record<string, import('./types.js').PluginColorDef> | undefined} colorDefs
 * @returns {string | undefined}
 */
export const resolvePluginColor = (theme, pluginId, colorKey, colorDefs) => {
  const def = colorDefs?.[colorKey]
  if (!def) return theme?.pluginColors?.[pluginId]?.[colorKey]
  const themable = def.themable !== false
  if (themable) {
    const override = theme?.pluginColors?.[pluginId]?.[colorKey]
    if (override) return override
  }
  if (def.default === 'accent') return theme?.ui?.accent
  return def.default
}
