/** @type {import('./types.js').ThemePlugin} */
export const slateTheme = {
  id: 'slate',
  label: 'Slate',
  defaultActive: true,
  ui: {
    font: '"Barlow", "Segoe UI", sans-serif',
    panelBg: 'rgba(30, 41, 59, 0.65)',
    panelBorder: 'rgba(148, 163, 184, 0.28)',
    panelText: '#f1f5f9',
    panelTextMuted: '#94a3b8',
    accent: '#38bdf8',
    accentText: '#0f172a',
    accentBorder: '#0ea5e9',
    controlBg: 'rgba(51, 65, 85, 0.7)',
    controlBorder: 'rgba(148, 163, 184, 0.35)',
    controlText: '#e2e8f0',
    controlHover: 'rgba(71, 85, 105, 0.82)',
    shadow: '0 10px 28px rgba(2, 6, 23, 0.45)',
    radius: '6px',
    blur: '4px',
  },
  pluginColors: {
    traffic: {
      aircraft: '#fde047',
    },
    ownship: {
      marker: '#fb7185',
    },
  },
}
