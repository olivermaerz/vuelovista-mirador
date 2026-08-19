/**
 * Sparse priority bands for map overlays. Higher draws on top.
 * Leave gaps so new layer types can slot in without renumbering.
 */
export const LayerPriority = {
  BASE: 100,
  CHART: 200,
  /** Controlled airspace / special-use polygons */
  AIRSPACE: 250,
  WEATHER: 300,
  RADAR: 400,
  /** VOR / NDB / fixes */
  NAVAID: 450,
  /** Airport markers (clickable; under traffic) */
  AIRPORT: 480,
  TRAFFIC: 500,
  /** Ownship breadcrumb / recorded track */
  TRACK: 550,
  OWNSHIP: 600,
}

/**
 * Ensure a Leaflet pane exists for this priority and return its name.
 * Marker-like overlays (AIRPORT+) get pointer-events so clicks/hovers work.
 *
 * @param {import('leaflet').Map} map
 * @param {number} priority
 * @returns {string} pane name
 */
export function ensurePriorityPane(map, priority) {
  const name = `overlay-${priority}`
  if (!map.getPane(name)) {
    map.createPane(name)
    const pane = map.getPane(name)
    pane.style.zIndex = String(priority)
    if (priority >= LayerPriority.AIRPORT) {
      pane.style.pointerEvents = 'auto'
    }
  }
  return name
}
