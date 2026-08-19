import { lightTheme } from './light.js'
import { slateTheme } from './slate.js'

/**
 * Registry of UI themes. To add one:
 * 1. Create `src/themes/yourTheme.js` exporting a ThemePlugin
 * 2. Import it here and append to this array
 *
 * Themes set chrome colors/transparency via `ui`.
 * Optional `pluginColors[mapPluginId][key]` overrides themable plugin defaults.
 */
export const themes = [slateTheme, lightTheme]

export const themeById = Object.fromEntries(themes.map((t) => [t.id, t]))

// Persist migration: older builds saved id "day"
themeById.day = lightTheme

export const defaultThemeId =
  themes.find((t) => t.defaultActive)?.id ?? themes[0]?.id ?? 'slate'
