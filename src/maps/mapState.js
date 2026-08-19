const STORAGE_KEY = 'flightplanning.map'

export const loadMapState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.lat !== 'number' ||
      typeof parsed?.lon !== 'number' ||
      typeof parsed?.zoom !== 'number'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const saveMapState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota / private mode — ignore
  }
}
