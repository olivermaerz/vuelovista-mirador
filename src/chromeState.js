const STORAGE_KEY = 'flightplanning.chromeCollapsed'

export const loadChromeCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** @param {boolean} collapsed */
export const saveChromeCollapsed = (collapsed) => {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    // Quota / private mode — ignore
  }
}
