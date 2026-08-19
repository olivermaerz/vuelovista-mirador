import { applyTheme, resolvePluginColor } from './applyTheme.js'
import { themes, themeById, defaultThemeId } from './index.js'

/** @type {Set<(theme: import('./types.js').ThemePlugin) => void>} */
const listeners = new Set()

/** @type {import('./types.js').ThemePlugin} */
let current = themeById[defaultThemeId] ?? themes[0]

/**
 * @param {string | null | undefined} id
 */
export const initTheme = (id) => {
  current = themeById[id] ?? themeById[defaultThemeId] ?? themes[0]
  applyTheme(current)
  return current
}

export const getTheme = () => current

export const getThemes = () => themes

/**
 * @param {string} id
 */
export const setTheme = (id) => {
  const next = themeById[id]
  if (!next || next.id === current.id) return current
  current = next
  applyTheme(current)
  for (const fn of listeners) fn(current)
  return current
}

/**
 * @param {(theme: import('./types.js').ThemePlugin) => void} fn
 * @returns {() => void}
 */
export const subscribeTheme = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * @param {string} pluginId
 * @param {string} colorKey
 * @param {Record<string, import('./types.js').PluginColorDef> | undefined} colorDefs
 */
export const themeColor = (pluginId, colorKey, colorDefs) =>
  resolvePluginColor(current, pluginId, colorKey, colorDefs)
