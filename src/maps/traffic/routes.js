import { httpFetch } from '../../net/http.js'
import { STANDING_DATA_PROXY_PREFIX } from '../../net/routes.js'

/**
 * @typedef {Object} RouteInfo
 * @property {string | null} airline
 * @property {string | null} origin
 * @property {string | null} destination
 */

/** @type {Map<string, Promise<RouteInfo | null>>} */
const routeInflight = new Map()
/** @type {Map<string, RouteInfo | null>} */
const routeCache = new Map()

const airportLabel = (ap) => {
  if (!ap || typeof ap !== 'object') return null
  const code = ap.iata || ap.icao
  const name = ap.location || ap.name
  if (code && name) return `${code} ${name}`
  return code || name || null
}

/**
 * Callsign → scheduled/plausible route from Virtual Radar standing data
 * (served via adsb.lol’s ODbL public data mirror).
 *
 * @param {string} callsign
 * @param {AbortSignal} [signal]
 * @returns {Promise<RouteInfo | null>}
 */
export const fetchCallsignRoute = (callsign, signal) => {
  const key = callsign.trim().toUpperCase()
  if (!key) return Promise.resolve(null)
  if (routeCache.has(key)) return Promise.resolve(routeCache.get(key) ?? null)
  const existing = routeInflight.get(key)
  if (existing) return existing

  const prefix = key.slice(0, 2)
  const path = `${STANDING_DATA_PROXY_PREFIX}/routes/${encodeURIComponent(prefix)}/${encodeURIComponent(key)}.json`

  const promise = httpFetch(path, { signal })
    .then(async (res) => {
      if (res.status === 404) {
        routeCache.set(key, null)
        return null
      }
      if (!res.ok) throw new Error(`standing-data HTTP ${res.status}`)
      const raw = await res.json()
      if (!raw || typeof raw !== 'object') {
        routeCache.set(key, null)
        return null
      }
      if (raw.airport_codes === 'unknown') {
        routeCache.set(key, null)
        return null
      }
      const airports = Array.isArray(raw._airports) ? raw._airports : []
      const origin = airports[0] ? airportLabel(airports[0]) : null
      const destination = airports.length
        ? airportLabel(airports[airports.length - 1])
        : null
      /** @type {RouteInfo} */
      const info = {
        airline: typeof raw.airline_code === 'string' ? raw.airline_code : null,
        origin,
        destination,
      }
      if (!info.origin && !info.destination) {
        routeCache.set(key, null)
        return null
      }
      routeCache.set(key, info)
      return info
    })
    .catch((err) => {
      if (err?.name === 'AbortError') throw err
      console.warn('[standing-data route]', err)
      return null
    })
    .finally(() => {
      routeInflight.delete(key)
    })

  routeInflight.set(key, promise)
  return promise
}
