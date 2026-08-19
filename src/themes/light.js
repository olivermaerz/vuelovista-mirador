/** @type {import('./types.js').ThemePlugin} */
export const lightTheme = {
  id: 'light',
  label: 'Light',
  defaultActive: false,
  ui: {
    font: '"Barlow", "Segoe UI", sans-serif',
    panelBg: 'rgba(248, 250, 252, 0.82)',
    panelBorder: 'rgba(15, 23, 42, 0.12)',
    panelText: '#0f172a',
    panelTextMuted: '#64748b',
    accent: '#0b6e4f',
    accentText: '#f8fafc',
    accentBorder: '#085c42',
    controlBg: 'rgba(255, 255, 255, 0.85)',
    controlBorder: 'rgba(15, 23, 42, 0.16)',
    controlText: '#1e293b',
    controlHover: 'rgba(241, 245, 249, 0.92)',
    shadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
    radius: '6px',
    blur: '4px',
  },
  pluginColors: {
    traffic: {
      aircraft: '#e8c200',
    },
    ownship: {
      marker: '#d62828',
    },
  },
}
