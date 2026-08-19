import L from 'leaflet'
import { LayerPriority } from '../layerPriority.js'
import { fetchLiveTraffic, shouldFetchTraffic } from '../traffic/adsblol.js'
import {
  fetchAircraftDetails,
  getCachedAircraftDetails,
} from '../traffic/adsbdb.js'
import {
  AIRCRAFT_ICON_SIZE,
  aircraftSvgMarkup,
} from '../traffic/aircraftIcons.js'
import { subscribeTheme, themeColor } from '../../themes/themeStore.js'

const POLL_MS = 12_000

/**
 * Traffic colors. `aircraft` is themable; special squawks stay fixed for recognition.
 * @type {Record<string, import('../../themes/types.js').PluginColorDef>}
 */
const TRAFFIC_COLORS = {
  aircraft: { default: '#ffee11', themable: true },
  hijacking: { default: '#e018e0', themable: false },
  radioFailure: { default: '#ff7a00', themable: false },
  emergency: { default: '#e01010', themable: false },
}

/** ICAO emergency / special-purpose squawks → color key + label. */
const SPECIAL_SQUAWKS = {
  '7500': { colorKey: 'hijacking', label: 'Hijacking' },
  '7600': { colorKey: 'radioFailure', label: 'Radio failure' },
  '7700': { colorKey: 'emergency', label: 'Emergency' },
}

const trafficFill = (colorKey) =>
  themeColor('traffic', colorKey, TRAFFIC_COLORS) ??
  TRAFFIC_COLORS[colorKey]?.default

/** @type {WeakMap<import('leaflet').Layer, PollerState>} */
const pollers = new WeakMap()

/**
 * @typedef {Object} PollerState
 * @property {ReturnType<typeof setInterval> | null} timer
 * @property {AbortController | null} abort
 * @property {() => void} onMoveEnd
 * @property {() => void} onTheme
 * @property {Map<string, import('leaflet').Marker>} markers
 * @property {string} pane
 * @property {(() => void) | null} unsubTheme
 */

/**
 * @param {string | null | undefined} squawk
 */
const specialSquawk = (squawk) => {
  if (!squawk) return null
  const spec = SPECIAL_SQUAWKS[squawk]
  if (!spec) return null
  return { color: trafficFill(spec.colorKey), label: spec.label }
}

/**
 * @param {import('../traffic/adsblol.js').AircraftState} ac
 */
const markerColor = (ac) =>
  specialSquawk(ac.squawk)?.color ?? trafficFill('aircraft')

/**
 * @param {number | null | undefined} trackDeg
 * @param {string} fill
 * @param {import('../traffic/aircraftIcons.js').AircraftIconKind} kind
 */
const planeIcon = (trackDeg, fill, kind) => {
  const rot = typeof trackDeg === 'number' ? trackDeg : 0
  const size = AIRCRAFT_ICON_SIZE[kind] ?? 28
  const half = size / 2
  return L.divIcon({
    className: 'traffic-marker',
    html: `<div class="traffic-marker-rot" style="width:${size}px;height:${size}px;transform:rotate(${rot}deg)">${aircraftSvgMarkup(fill, kind, size)}</div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
  })
}

const fmt = (value, unit) => (value == null ? '—' : `${value} ${unit}`)

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Hover tooltips fight popups on tap; only bind where hover exists. */
const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

const TRAFFIC_TOOLTIP_OPTS = {
  direction: 'top',
  offset: [0, -12],
  opacity: 1,
  className: 'traffic-tooltip',
}

/**
 * @param {import('../traffic/adsblol.js').AircraftState} ac
 */
const tooltipHtml = (ac) => {
  const id = ac.callsign || ac.registration || ac.icao24.toUpperCase()
  const type = ac.typecode ? `${ac.typecode} · ` : ''
  const alt = ac.onGround ? 'GND' : fmt(ac.altitudeFt, 'ft')
  const spd = fmt(ac.speedKt, 'kt')
  const sq = ac.squawk || '----'
  const special = specialSquawk(ac.squawk)
  const alert = special ? ` · ${special.label}` : ''
  return `${id} · ${type}sq ${sq}${alert} · ${alt} · ${spd}`
}

/**
 * @param {import('leaflet').Marker} marker
 * @param {import('../traffic/adsblol.js').AircraftState} ac
 */
const syncTooltip = (marker, ac) => {
  if (!canHover()) return
  const tip = tooltipHtml(ac)
  if (marker.getTooltip()) marker.setTooltipContent(tip)
  else marker.bindTooltip(tip, TRAFFIC_TOOLTIP_OPTS)
}

/**
 * @param {import('../traffic/adsblol.js').AircraftState} ac
 * @param {import('../traffic/adsbdb.js').AircraftDetails | null | undefined} details
 * @param {{ loading?: boolean }} [opts]
 */
const popupHtml = (ac, details, opts = {}) => {
  const title = ac.callsign || ac.registration || ac.icao24.toUpperCase()
  const special = specialSquawk(ac.squawk)
  const squawkCell = special
    ? `<span class="traffic-squawk-alert" style="color:${special.color}">${esc(ac.squawk)} — ${esc(special.label)}</span>`
    : esc(ac.squawk || '—')

  const liveType =
    [ac.typecode, ac.categoryLabel].filter(Boolean).join(' · ') || null
  const dbAircraft = details?.aircraft
  const typeCell =
    liveType ||
    (dbAircraft
      ? [dbAircraft.icaoType, dbAircraft.type].filter(Boolean).join(' · ')
      : null) ||
    (opts.loading ? null : '—')

  /** @type {[string, string][]} */
  const rows = [
    ['Callsign', esc(ac.callsign || '—')],
    ['Registration', esc(ac.registration || dbAircraft?.registration || '—')],
    ['ICAO24', esc(ac.icao24.toUpperCase())],
    [
      'Type',
      typeCell == null
        ? '<span class="traffic-popup-muted">Loading…</span>'
        : esc(typeCell),
    ],
    ['Category', esc(ac.categoryLabel || ac.category || '—')],
    ['Altitude', ac.onGround ? 'On ground' : esc(fmt(ac.altitudeFt, 'ft'))],
    ['Ground speed', esc(fmt(ac.speedKt, 'kt'))],
    ['Track', ac.track == null ? '—' : `${Math.round(ac.track)}°`],
    ['Vertical rate', esc(fmt(ac.verticalRateFpm, 'fpm'))],
    ['Squawk', squawkCell],
  ]

  if (dbAircraft) {
    rows.push(
      ['Manufacturer', esc(dbAircraft.manufacturer || '—')],
      ['Operator', esc(dbAircraft.owner || '—')],
    )
  } else if (opts.loading) {
    rows.push(['Operator', '<span class="traffic-popup-muted">Loading…</span>'])
  }

  const route = details?.route
  if (route) {
    const od =
      route.origin || route.destination
        ? `${route.origin || '?'} → ${route.destination || '?'}`
        : null
    rows.push(
      ['Airline', esc(route.airline || '—')],
      ['Route', esc(od || '—')],
    )
  } else if (opts.loading && ac.callsign) {
    rows.push(['Route', '<span class="traffic-popup-muted">Loading…</span>'])
  }

  const body = rows
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join('')

  const photo =
    dbAircraft?.photoThumb
      ? `<img class="traffic-popup-photo" src="${esc(dbAircraft.photoThumb)}" alt="" loading="lazy" />`
      : ''

  return `<div class="traffic-popup"><strong>${esc(title)}</strong>${photo}<table>${body}</table></div>`
}

/**
 * @param {import('leaflet').Marker} marker
 * @param {import('../traffic/adsblol.js').AircraftState} ac
 */
const syncPopup = (marker, ac) => {
  marker._traffic = ac
  const cached = getCachedAircraftDetails(ac.icao24)
  const open = marker.isPopupOpen()
  marker.setPopupContent(
    popupHtml(ac, cached, { loading: open && !cached }),
  )
}

/**
 * @param {import('leaflet').Marker} marker
 */
const bindDetailLookup = (marker) => {
  marker.on('popupopen', async () => {
    const ac = marker._traffic
    if (!ac) return
    const cached = getCachedAircraftDetails(ac.icao24)
    if (cached && cached.routeCallsign === (ac.callsign?.trim() || null)) {
      marker.setPopupContent(popupHtml(ac, cached))
      return
    }
    marker.setPopupContent(popupHtml(ac, cached, { loading: true }))
    try {
      const details = await fetchAircraftDetails(ac)
      if (marker._traffic?.icao24 !== ac.icao24) return
      marker.setPopupContent(popupHtml(marker._traffic, details))
    } catch (err) {
      if (err?.name === 'AbortError') return
      console.warn('[traffic details]', err)
      if (marker._traffic?.icao24 === ac.icao24) {
        marker.setPopupContent(popupHtml(marker._traffic, cached))
      }
    }
  })
}

/**
 * @param {import('leaflet').Map} map
 * @param {import('leaflet').LayerGroup} layer
 * @param {PollerState} state
 */
const refresh = async (map, layer, state) => {
  if (!shouldFetchTraffic(map.getBounds(), map.getZoom())) {
    state.markers.forEach((m) => layer.removeLayer(m))
    state.markers.clear()
    return
  }

  state.abort?.abort()
  const abort = new AbortController()
  state.abort = abort

  let aircraft
  try {
    aircraft = await fetchLiveTraffic(map, { signal: abort.signal })
  } catch (err) {
    if (err?.name === 'AbortError') return
    console.warn('[traffic]', err)
    return
  }

  if (abort.signal.aborted) return

  const seen = new Set()
  for (const ac of aircraft) {
    seen.add(ac.icao24)
    const latLng = L.latLng(ac.lat, ac.lon)
    const fill = markerColor(ac)
    let marker = state.markers.get(ac.icao24)
    if (marker) {
      marker.setLatLng(latLng)
      marker.setIcon(planeIcon(ac.track, fill, ac.iconKind))
      syncTooltip(marker, ac)
      syncPopup(marker, ac)
    } else {
      marker = L.marker(latLng, {
        icon: planeIcon(ac.track, fill, ac.iconKind),
        pane: state.pane,
        title: ac.callsign || ac.registration || ac.icao24.toUpperCase(),
      })
      syncTooltip(marker, ac)
      marker.bindPopup(popupHtml(ac, getCachedAircraftDetails(ac.icao24)), {
        className: 'traffic-popup-wrap',
      })
      marker._traffic = ac
      bindDetailLookup(marker)
      marker.addTo(layer)
      state.markers.set(ac.icao24, marker)
    }
  }

  for (const [icao, marker] of state.markers) {
    if (!seen.has(icao)) {
      layer.removeLayer(marker)
      state.markers.delete(icao)
    }
  }
}

/** @type {import('../types.js').MapPlugin} */
export const trafficPlugin = {
  id: 'traffic',
  label: 'Live traffic',
  defaultActive: true,
  priority: LayerPriority.TRAFFIC,
  group: 'traffic',
  colors: TRAFFIC_COLORS,
  createLayer: (_map, { pane }) =>
    L.layerGroup([], {
      pane,
      attribution:
        'Traffic &copy; <a href="https://adsb.lol">adsb.lol</a>; ' +
        'routes via VRS standing data; ' +
        'aircraft DB &copy; <a href="https://adsbdb.com">adsbdb</a>',
    }),
  start({ map, layer, pane }) {
    /** @type {PollerState} */
    const state = {
      timer: null,
      abort: null,
      onMoveEnd: () => {
        refresh(map, /** @type {import('leaflet').LayerGroup} */ (layer), state)
      },
      onTheme: () => {
        for (const marker of state.markers.values()) {
          const ac = marker._traffic
          if (!ac) continue
          marker.setIcon(planeIcon(ac.track, markerColor(ac), ac.iconKind))
          syncPopup(marker, ac)
        }
      },
      markers: new Map(),
      pane,
      unsubTheme: null,
    }
    pollers.set(layer, state)
    map.on('moveend', state.onMoveEnd)
    state.unsubTheme = subscribeTheme(state.onTheme)
    state.timer = setInterval(state.onMoveEnd, POLL_MS)
    state.onMoveEnd()
  },
  stop({ map, layer }) {
    const state = pollers.get(layer)
    if (!state) return
    map.off('moveend', state.onMoveEnd)
    state.unsubTheme?.()
    if (state.timer != null) clearInterval(state.timer)
    state.abort?.abort()
    state.markers.forEach((m) => {
      /** @type {import('leaflet').LayerGroup} */ (layer).removeLayer(m)
    })
    state.markers.clear()
    pollers.delete(layer)
  },
}
