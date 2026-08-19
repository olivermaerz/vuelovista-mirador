import { httpFetch } from '../../net/http.js'
import { ADSBDB_PROXY_PREFIX } from '../../net/routes.js'
import { fetchCallsignRoute } from './routes.js'

/**
 * @typedef {Object} AircraftInfo
 * @property {string | null} registration
 * @property {string | null} type
 * @property {string | null} icaoType
 * @property {string | null} manufacturer
 * @property {string | null} owner
 * @property {string | null} photoThumb
 */

/**
 * @typedef {import('./routes.js').RouteInfo} RouteInfo
 */

/**
 * @typedef {Object} AircraftDetails
 * @property {AircraftInfo | null} aircraft
 * @property {RouteInfo | null} route
 * @property {string | null} routeCallsign
 */

/** @type {Map<string, Promise<AircraftInfo | null>>} */
const aircraftInflight = new Map()
/** @type {Map<string, AircraftInfo | null>} */
const aircraftCache = new Map()

/** @type {Map<string, AircraftDetails>} */
const detailsCache = new Map()

/**
 * @param {string} path
 * @param {AbortSignal} [signal]
 */
const getJson = async (path, signal) => {
  const res = await httpFetch(`${ADSBDB_PROXY_PREFIX}${path}`, { signal })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`adsbdb HTTP ${res.status}`)
  return res.json()
}

/**
 * @param {string} icao24
 * @param {AbortSignal} [signal]
 * @returns {Promise<AircraftInfo | null>}
 */
const fetchAircraft = (icao24, signal) => {
  const key = icao24.toLowerCase()
  if (aircraftCache.has(key)) return Promise.resolve(aircraftCache.get(key) ?? null)
  const existing = aircraftInflight.get(key)
  if (existing) return existing

  const promise = getJson(`/v0/aircraft/${encodeURIComponent(key.toUpperCase())}`, signal)
    .then((data) => {
      const raw = data?.response?.aircraft
      if (!raw || typeof raw !== 'object') {
        aircraftCache.set(key, null)
        return null
      }
      /** @type {AircraftInfo} */
      const info = {
        registration: raw.registration || null,
        type: raw.type || null,
        icaoType: raw.icao_type || null,
        manufacturer: raw.manufacturer || null,
        owner: raw.registered_owner || null,
        photoThumb: raw.url_photo_thumbnail || raw.url_photo || null,
      }
      aircraftCache.set(key, info)
      return info
    })
    .catch((err) => {
      if (err?.name === 'AbortError') throw err
      console.warn('[adsbdb aircraft]', err)
      return null
    })
    .finally(() => {
      aircraftInflight.delete(key)
    })

  aircraftInflight.set(key, promise)
  return promise
}

/**
 * Cached aircraft (adsbdb) + route (VRS standing data via adsb.lol mirror).
 * @param {{ icao24: string, callsign: string | null }} ac
 * @param {AbortSignal} [signal]
 * @returns {Promise<AircraftDetails>}
 */
export async function fetchAircraftDetails(ac, signal) {
  const icao = ac.icao24.toLowerCase()
  const callsign = ac.callsign?.trim() || null
  const cached = detailsCache.get(icao)

  if (
    cached &&
    cached.aircraft !== undefined &&
    cached.routeCallsign === callsign
  ) {
    return cached
  }

  const [aircraft, route] = await Promise.all([
    fetchAircraft(ac.icao24, signal),
    callsign ? fetchCallsignRoute(callsign, signal) : Promise.resolve(null),
  ])

  /** @type {AircraftDetails} */
  const details = {
    aircraft,
    route,
    routeCallsign: callsign,
  }
  detailsCache.set(icao, details)
  return details
}

/**
 * @param {string} icao24
 * @returns {AircraftDetails | undefined}
 */
export function getCachedAircraftDetails(icao24) {
  return detailsCache.get(icao24.toLowerCase())
}
