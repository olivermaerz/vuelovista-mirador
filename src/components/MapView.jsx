import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapPlugins } from '../maps/plugins/index.js'
import {
  getChartApiKey,
  loadLicensedCharts,
  saveLicensedCharts,
  setChartApiKey,
} from '../maps/licensedCharts.js'
import { loadMapState, saveMapState } from '../maps/mapState.js'
import { ensurePriorityPane, LayerPriority } from '../maps/layerPriority.js'
import {
  basemaps,
  createBasemapLayer,
  getBasemap,
  resolveBasemapId,
} from '../maps/basemaps.js'
import {
  getThemes,
  initTheme,
  setTheme,
  subscribeTheme,
  themeColor,
} from '../themes/themeStore.js'
import MapChrome from './MapChrome.jsx'
import { LocateControl } from './LocateControl.js'

const DEFAULT_ZOOM = 9
const DEFAULT_CENTER = [50.0, 10.0]
const DEFAULT_OVERVIEW_ZOOM = 6

/** @type {Record<string, import('../themes/types.js').PluginColorDef>} */
const OWNSHIP_COLORS = {
  marker: { default: '#ff2d2d', themable: true },
}

const ownshipIcon = () => {
  const fill =
    themeColor('ownship', 'marker', OWNSHIP_COLORS) ?? OWNSHIP_COLORS.marker.default
  return L.divIcon({
    className: 'airplane-marker',
    html:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">' +
      `<path fill="${fill}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" ` +
      'd="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>' +
      '</svg>',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  })
}

const defaultActive = () =>
  Object.fromEntries(mapPlugins.map((plugin) => [plugin.id, plugin.defaultActive]))

/** @param {Record<string, boolean>} active @param {Record<string, boolean>} licensed */
const clampActiveToLicense = (active, licensed) => {
  const next = { ...active }
  for (const plugin of mapPlugins) {
    if (!plugin.requiresLicense) continue
    const licensedOn = Boolean(licensed[plugin.id])
    const keyOk =
      !plugin.requiresLicense.requiresApiKey || Boolean(getChartApiKey(plugin.id))
    if (!licensedOn || !keyOk) next[plugin.id] = false
  }
  return next
}

const mergeActive = (savedActive, licensed) => {
  const base = defaultActive()
  if (!savedActive || typeof savedActive !== 'object') {
    return clampActiveToLicense(base, licensed)
  }
  for (const plugin of mapPlugins) {
    if (typeof savedActive[plugin.id] === 'boolean') {
      base[plugin.id] = savedActive[plugin.id]
    }
  }
  return clampActiveToLicense(base, licensed)
}

const pluginById = Object.fromEntries(mapPlugins.map((p) => [p.id, p]))

const licenseGates = mapPlugins.filter((p) => p.requiresLicense)

const lifecycleCtx = (map, id, layers) => {
  const plugin = pluginById[id]
  const layer = layers[id]
  if (!plugin || !layer) return null
  return {
    map,
    layer,
    pane: ensurePriorityPane(map, plugin.priority),
  }
}

const startPlugin = (map, id, layers) => {
  const plugin = pluginById[id]
  const ctx = lifecycleCtx(map, id, layers)
  if (!plugin?.start || !ctx) return
  plugin.start(ctx)
}

const stopPlugin = (map, id, layers) => {
  const plugin = pluginById[id]
  const ctx = lifecycleCtx(map, id, layers)
  if (!plugin?.stop || !ctx) return
  plugin.stop(ctx)
}

const locateByIp = (onLocation) =>
  fetch('https://get.geojs.io/v1/ip/geo.json')
    .then((res) => {
      if (!res.ok) throw new Error('IP geo HTTP ' + res.status)
      return res.json()
    })
    .then((data) => {
      const lat = parseFloat(data.latitude)
      const lon = parseFloat(data.longitude)
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        throw new Error('IP geo missing coordinates')
      }
      onLocation(lat, lon)
    })

const locateUser = (onLocation) => {
  if (!navigator.geolocation) {
    locateByIp(onLocation).catch(() => {})
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => onLocation(pos.coords.latitude, pos.coords.longitude),
    () => locateByIp(onLocation).catch(() => {}),
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
  )
}

const MapView = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef({})
  const baseLayerRef = useRef(null)
  const basePaneRef = useRef(null)
  const markerRef = useRef(null)
  const ownshipPaneRef = useRef(null)
  const activeRef = useRef(null)
  const themeIdRef = useRef(null)
  const basemapIdRef = useRef(null)
  const saved = useMemo(() => loadMapState(), [])
  const [licensedCharts, setLicensedCharts] = useState(() => loadLicensedCharts())
  const [active, setActive] = useState(() =>
    mergeActive(saved?.active, loadLicensedCharts()),
  )
  const [themeId, setThemeId] = useState(() => initTheme(saved?.theme).id)
  const [basemapId, setBasemapId] = useState(() => resolveBasemapId(saved?.basemap))
  const plugins = useMemo(
    () =>
      mapPlugins.filter((plugin) => {
        if (!plugin.requiresLicense) return true
        if (!licensedCharts[plugin.id]) return false
        if (
          plugin.requiresLicense.requiresApiKey &&
          !getChartApiKey(plugin.id)
        ) {
          return false
        }
        return true
      }),
    [licensedCharts],
  )
  const themes = useMemo(() => getThemes(), [])

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    themeIdRef.current = themeId
  }, [themeId])

  useEffect(() => {
    basemapIdRef.current = basemapId
  }, [basemapId])

  useEffect(() => {
    const unsub = subscribeTheme((theme) => {
      setThemeId(theme.id)
      if (markerRef.current) {
        markerRef.current.setIcon(ownshipIcon())
      }
    })
    return unsub
  }, [])

  const persistView = (overrides = {}) => {
    const map = mapInstanceRef.current
    if (!map) return
    const center = map.getCenter()
    saveMapState({
      lat: center.lat,
      lon: center.lng,
      zoom: map.getZoom(),
      active: activeRef.current,
      theme: themeIdRef.current,
      basemap: basemapIdRef.current,
      ...overrides,
    })
  }

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    const startActive = mergeActive(saved?.active, loadLicensedCharts())
    const startBasemapId = resolveBasemapId(saved?.basemap)
    const hasSavedView = saved != null

    const map = L.map(mapRef.current).setView(
      hasSavedView ? [saved.lat, saved.lon] : DEFAULT_CENTER,
      hasSavedView ? saved.zoom : DEFAULT_OVERVIEW_ZOOM,
    )
    mapInstanceRef.current = map

    const invalidateMapSize = () => map.invalidateSize({ pan: false })
    const initialInvalidateTimer = window.setTimeout(invalidateMapSize, 0)
    const delayedInvalidateTimer = window.setTimeout(invalidateMapSize, 300)
    window.addEventListener('resize', invalidateMapSize)
    window.visualViewport?.addEventListener('resize', invalidateMapSize)

    const basePane = ensurePriorityPane(map, LayerPriority.BASE)
    basePaneRef.current = basePane
    ownshipPaneRef.current = ensurePriorityPane(map, LayerPriority.OWNSHIP)

    const baseLayer = createBasemapLayer(getBasemap(startBasemapId), basePane)
    baseLayerRef.current = baseLayer
    baseLayer.addTo(map)

    const layers = {}
    for (const plugin of mapPlugins) {
      const pane = ensurePriorityPane(map, plugin.priority)
      const layer = plugin.createLayer(map, { pane })
      layers[plugin.id] = layer
      if (startActive[plugin.id]) {
        layer.addTo(map)
        startPlugin(map, plugin.id, layers)
      }
    }
    layersRef.current = layers

    const placeMarker = (lat, lon) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon])
      } else {
        markerRef.current = L.marker([lat, lon], {
          icon: ownshipIcon(),
          title: 'You are here',
          pane: ownshipPaneRef.current,
          zIndexOffset: 1000,
        }).addTo(map)
      }
    }

    const centerOn = (lat, lon, zoom = map.getZoom()) => {
      map.setView([lat, lon], zoom)
      placeMarker(lat, lon)
    }

    const persist = () => persistView()

    map.on('moveend', persist)
    map.on('zoomend', persist)
    map.on('locate:request', () => {
      locateUser((lat, lon) => centerOn(lat, lon, Math.max(map.getZoom(), DEFAULT_ZOOM)))
    })

    new LocateControl().addTo(map)

    if (!hasSavedView) {
      locateUser((lat, lon) => centerOn(lat, lon, DEFAULT_ZOOM))
    }

    return () => {
      for (const plugin of mapPlugins) {
        if (activeRef.current?.[plugin.id]) {
          stopPlugin(map, plugin.id, layersRef.current)
        }
      }
      map.off('moveend', persist)
      map.off('zoomend', persist)
      window.clearTimeout(initialInvalidateTimer)
      window.clearTimeout(delayedInvalidateTimer)
      window.removeEventListener('resize', invalidateMapSize)
      window.visualViewport?.removeEventListener('resize', invalidateMapSize)
      map.remove()
      mapInstanceRef.current = null
      layersRef.current = {}
      baseLayerRef.current = null
      basePaneRef.current = null
      markerRef.current = null
      ownshipPaneRef.current = null
    }
  }, [saved])

  const setLayerOn = (id, nextOn) => {
    const map = mapInstanceRef.current
    const layer = layersRef.current[id]
    if (!map || !layer) return

    setActive((prev) => {
      if (Boolean(prev[id]) === nextOn) return prev
      if (nextOn) {
        map.addLayer(layer)
        startPlugin(map, id, layersRef.current)
      } else {
        stopPlugin(map, id, layersRef.current)
        map.removeLayer(layer)
      }
      const next = { ...prev, [id]: nextOn }
      persistView({ active: next })
      return next
    })
  }

  const toggleLayer = (id) => {
    setLayerOn(id, !activeRef.current?.[id])
  }

  const setLicensedChart = (id, enabled, apiKey) => {
    if (enabled) {
      const plugin = pluginById[id]
      if (plugin?.requiresLicense?.requiresApiKey) {
        const key = typeof apiKey === 'string' ? apiKey.trim() : ''
        if (!key) return
        setChartApiKey(id, key)
      }
    } else {
      setChartApiKey(id, null)
      setLayerOn(id, false)
    }

    setLicensedCharts((prev) => {
      const next = { ...prev, [id]: enabled }
      saveLicensedCharts(next)
      return next
    })
  }

  const selectBasemap = (id) => {
    const nextId = resolveBasemapId(id)
    const map = mapInstanceRef.current
    const pane = basePaneRef.current
    if (!map || !pane) {
      setBasemapId(nextId)
      return
    }

    const prev = baseLayerRef.current
    if (prev) map.removeLayer(prev)

    const nextLayer = createBasemapLayer(getBasemap(nextId), pane)
    baseLayerRef.current = nextLayer
    nextLayer.addTo(map)

    basemapIdRef.current = nextId
    setBasemapId(nextId)
    persistView({ basemap: nextId })
  }

  const selectTheme = (id) => {
    setTheme(id)
    persistView({ theme: id })
  }

  return (
    <>
      <MapChrome
        themes={themes}
        themeId={themeId}
        onSelectTheme={selectTheme}
        basemaps={basemaps}
        basemapId={basemapId}
        onSelectBasemap={selectBasemap}
        plugins={plugins}
        active={active}
        onToggleLayer={toggleLayer}
        licenseGates={licenseGates}
        licensedCharts={licensedCharts}
        onSetLicensedChart={setLicensedChart}
      />
      <div id="map" ref={mapRef} />
    </>
  )
}

export default MapView
