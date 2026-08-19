import { httpFetch } from '../../net/http.js'
import { ADSBLOL_PROXY_PREFIX } from '../../net/routes.js'

/** Max lat/lon span (degrees) before we skip a poll. */
export const MAX_BBOX_SPAN = 8

/** Min map zoom to request traffic. */
export const MIN_TRAFFIC_ZOOM = 7

/** ADS-B emitter category (DO-260B) → display label. */
const CATEGORY_LABELS = {
  A0: 'No category info',
  A1: 'Light',
  A2: 'Small',
  A3: 'Large',
  A4: 'High vortex large',
  A5: 'Heavy',
  A6: 'High performance',
  A7: 'Rotorcraft',
  B0: 'No category info',
  B1: 'Glider',
  B2: 'Lighter-than-air',
  B3: 'Parachute',
  B4: 'Ultralight',
  B6: 'UAV',
  B7: 'Space',
  C0: 'Surface emergency vehicle',
  C1: 'Surface service vehicle',
  C2: 'Point obstacle',
  C3: 'Cluster obstacle',
}

/** Exact ICAO type designators → icon kind (highest priority). */
const TYPE_KIND = {
  // Super-heavy / double-deck / outsize
  A388: 'superheavy',
  A225: 'superheavy',
  A124: 'superheavy',

  // A320 family (incl. neo) — must not hit heli prefixes like A20*
  A318: 'jet',
  A319: 'jet',
  A19N: 'jet',
  A320: 'jet',
  A20N: 'jet',
  A321: 'jet',
  A21N: 'jet',

  // Common GA monoplanes
  SR20: 'light',
  SR22: 'light',
  C150: 'light',
  C152: 'light',
  C170: 'light',
  C172: 'light',
  C177: 'light',
  C182: 'light',
  C206: 'light',
  C208: 'light',
  C210: 'light',
  PA28: 'light',
  P28A: 'light',
  P28B: 'light',
  P28R: 'light',
  PA32: 'light',
  PA34: 'light',
  PA44: 'light',
  PA46: 'light',
  DA40: 'light',
  DA42: 'light',
  DA62: 'light',
  DV20: 'light',
  BE33: 'light',
  BE35: 'light',
  BE36: 'light',
  BE55: 'light',
  BE58: 'light',
  M20P: 'light',
  M20T: 'light',
  AA5: 'light',
  TOBA: 'light',
  TB20: 'light',
  TB21: 'light',
  E300: 'light',
  EXTRA: 'light',
  DR40: 'light',
  DR41: 'light',
  PC12: 'light',
  TBM7: 'light',
  TBM8: 'light',
  TBM9: 'light',
  LEG2: 'light',
  COL3: 'light',
  COL4: 'light',

  // Military airlifters / heavies often miscategorized
  C17: 'heavy',
  C5M: 'heavy',
  C5: 'heavy',
  KC10: 'heavy',
  KC46: 'heavy',
  KC35: 'heavy',
}

/**
 * Prefix rules applied after exact matches (order matters).
 * Avoid short prefixes that collide with airliners (e.g. A20 → A20N A320neo).
 * @type {{ re: RegExp, kind: import('./aircraftIcons.js').AircraftIconKind }[]}
 */
const TYPE_PREFIX_RULES = [
  {
    re: /^(A109|A119|A139|A149|A169|A189|AS3|AS5|AS6|AW1|B06|B212|B412|B407|B429|B505|BK1|EC2|EC3|EC4|EC5|EC55|EC75|H12|H13|H14|H15|H16|H17|H20|H22|H60|MI8|MI1|R22|R44|R66|S76|S92|UH1|MD50|MD52|MD60|NH90|TIGR|PUMA|LYNX|WAS45)/i,
    kind: 'heli',
  },
  {
    re: /^(GLID|ASK|ASW|DG[0-9]|LS[0-9]|SZD|VENT|DISC|NIMB|JS1|STEM)/i,
    kind: 'glider',
  },
  {
    // Widebodies / heavies (A300/A310/A330–A350, 747/777/787, MD-11, Il-76/96)
    // Note: A318/A319/A320/A321 stay as jet (exact + default).
    re: /^(A306|A30B|A310|A33|A34|A35|B74|B77|B78|MD1|DC10|IL7|IL9|A400)/i,
    kind: 'heavy',
  },
  {
    // Light GA families (avoid bare C17 — that is the Globemaster)
    re: /^(C15[0-2]|C17[0-9]|C18[0-9]|C20[0-9]|C21[0-9]|C31[0-9]|PA2|PA3|PA4|SR2|DA4|DA6|DV2|DR4|P28|BE3|BE5|BE6|M20|AA5|TOBA|TB2|E30|PC1|TBM|COL|LEG)/i,
    kind: 'light',
  },
]

/**
 * @param {import('leaflet').LatLngBounds} bounds
 * @param {number} zoom
 */
export function shouldFetchTraffic(bounds, zoom) {
  if (zoom < MIN_TRAFFIC_ZOOM) return false
  const latSpan = bounds.getNorth() - bounds.getSouth()
  const lonSpan = bounds.getEast() - bounds.getWest()
  return latSpan <= MAX_BBOX_SPAN && lonSpan <= MAX_BBOX_SPAN
}

/**
 * @param {string | null | undefined} category
 * @param {string | null | undefined} typecode
 * @returns {import('./aircraftIcons.js').AircraftIconKind}
 */
export function resolveIconKind(category, typecode) {
  const cat = (category || '').toUpperCase()
  const t = (typecode || '').toUpperCase()

  if (t && TYPE_KIND[t]) return TYPE_KIND[t]

  if (t) {
    for (const rule of TYPE_PREFIX_RULES) {
      if (rule.re.test(t)) return rule.kind
    }
  }

  if (cat === 'A7') return 'heli'
  if (cat === 'B1') return 'glider'
  if (cat === 'B6') return 'uav'
  if (cat === 'B2' || cat === 'B3' || cat === 'B4') return 'ultralight'
  if (cat === 'A1' || cat === 'A2') return 'light'
  if (cat === 'A5' || cat === 'A4') return 'heavy'
  if (cat === 'A3' || cat === 'A6') return 'jet'
  return 'jet'
}

/**
 * @param {import('leaflet').Map} map
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<AircraftState[]>}
 */
export async function fetchLiveTraffic(map, { signal } = {}) {
  const bounds = map.getBounds()
  const center = map.getCenter()
  const distNm = Math.min(
    250,
    Math.max(5, Math.ceil(center.distanceTo(bounds.getNorthEast()) / 1852)),
  )

  const url =
    `${ADSBLOL_PROXY_PREFIX}/v2/lat/${center.lat.toFixed(4)}` +
    `/lon/${center.lng.toFixed(4)}/dist/${distNm}`

  const res = await httpFetch(url, { signal })
  if (!res.ok) {
    throw new Error(`adsb.lol HTTP ${res.status}`)
  }

  const data = await res.json()
  const rows = Array.isArray(data?.ac) ? data.ac : []
  /** @type {AircraftState[]} */
  const out = []

  for (const raw of rows) {
    const icao24 = typeof raw.hex === 'string' ? raw.hex.replace(/^~/, '') : null
    const lat = typeof raw.lat === 'number' ? raw.lat : null
    const lon = typeof raw.lon === 'number' ? raw.lon : null
    if (!icao24 || lat == null || lon == null) continue

    const callsign =
      typeof raw.flight === 'string' && raw.flight.trim() ? raw.flight.trim() : null
    const typecode = typeof raw.t === 'string' && raw.t.trim() ? raw.t.trim() : null
    const registration =
      typeof raw.r === 'string' && raw.r.trim() ? raw.r.trim() : null
    const category =
      typeof raw.category === 'string' && raw.category.trim()
        ? raw.category.trim().toUpperCase()
        : null
    const onGround = raw.alt_baro === 'ground'
    const altFt =
      typeof raw.alt_baro === 'number'
        ? Math.round(raw.alt_baro)
        : typeof raw.alt_geom === 'number'
          ? Math.round(raw.alt_geom)
          : null
    const speedKt = typeof raw.gs === 'number' ? Math.round(raw.gs) : null
    const track = typeof raw.track === 'number' ? raw.track : null
    const verticalRateFpm =
      typeof raw.baro_rate === 'number'
        ? Math.round(raw.baro_rate)
        : typeof raw.geom_rate === 'number'
          ? Math.round(raw.geom_rate)
          : null
    const squawk = typeof raw.squawk === 'string' ? raw.squawk : null

    const categoryLabel = category
      ? CATEGORY_LABELS[category] ?? category
      : null

    out.push({
      icao24,
      callsign,
      registration,
      typecode,
      originCountry: null,
      lat,
      lon,
      altitudeFt: onGround ? 0 : altFt,
      onGround,
      speedKt,
      track,
      verticalRateFpm,
      squawk,
      category,
      categoryLabel,
      iconKind: resolveIconKind(category, typecode),
    })
  }

  return out
}

/**
 * @typedef {import('./aircraftIcons.js').AircraftIconKind} AircraftIconKind
 */

/**
 * @typedef {Object} AircraftState
 * @property {string} icao24
 * @property {string | null} callsign
 * @property {string | null} registration
 * @property {string | null} typecode
 * @property {string | null} originCountry
 * @property {number} lat
 * @property {number} lon
 * @property {number | null} altitudeFt
 * @property {boolean} onGround
 * @property {number | null} speedKt
 * @property {number | null} track
 * @property {number | null} verticalRateFpm
 * @property {string | null} squawk
 * @property {string | null} category
 * @property {string | null} categoryLabel
 * @property {AircraftIconKind} iconKind
 */
