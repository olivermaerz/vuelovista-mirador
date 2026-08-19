const LICENSED_KEY = 'flightplanning.licensedCharts'
const API_KEYS_KEY = 'flightplanning.chartApiKeys'

/**
 * @returns {Record<string, boolean>}
 */
export const loadLicensedCharts = () => {
  try {
    const raw = localStorage.getItem(LICENSED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    /** @type {Record<string, boolean>} */
    const out = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'boolean') out[id] = value
    }
    return out
  } catch {
    return {}
  }
}

/**
 * @param {Record<string, boolean>} state
 */
export const saveLicensedCharts = (state) => {
  try {
    localStorage.setItem(LICENSED_KEY, JSON.stringify(state))
  } catch {
    // Quota / private mode — ignore
  }
}

/**
 * @returns {Record<string, string>}
 */
export const loadChartApiKeys = () => {
  try {
    const raw = localStorage.getItem(API_KEYS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    /** @type {Record<string, string>} */
    const out = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) out[id] = value.trim()
    }
    return out
  } catch {
    return {}
  }
}

/**
 * @param {string} pluginId
 * @returns {string}
 */
export const getChartApiKey = (pluginId) => loadChartApiKeys()[pluginId] || ''

/**
 * @param {string} pluginId
 * @param {string | null | undefined} apiKey
 */
export const setChartApiKey = (pluginId, apiKey) => {
  const next = loadChartApiKeys()
  const trimmed = typeof apiKey === 'string' ? apiKey.trim() : ''
  if (trimmed) next[pluginId] = trimmed
  else delete next[pluginId]
  try {
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(next))
  } catch {
    // Quota / private mode — ignore
  }
}
