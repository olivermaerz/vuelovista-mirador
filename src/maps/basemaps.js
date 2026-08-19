import L from 'leaflet'

/**
 * @typedef {Object} BasemapDef
 * @property {string} id
 * @property {string} label
 * @property {string} url
 * @property {string} attribution
 * @property {number} [maxZoom]
 * @property {string|string[]} [subdomains]
 */

/** @type {BasemapDef[]} */
export const basemaps = [
  {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: 'opentopo',
    label: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
]

export const DEFAULT_BASEMAP_ID = 'osm'

const basemapById = Object.fromEntries(basemaps.map((b) => [b.id, b]))

/** @param {string | undefined | null} id */
export const resolveBasemapId = (id) =>
  id && basemapById[id] ? id : DEFAULT_BASEMAP_ID

/** @param {string} id */
export const getBasemap = (id) => basemapById[resolveBasemapId(id)]

/**
 * @param {BasemapDef} def
 * @param {string} pane
 * @returns {import('leaflet').TileLayer}
 */
export const createBasemapLayer = (def, pane) =>
  L.tileLayer(def.url, {
    pane,
    maxZoom: def.maxZoom ?? 19,
    attribution: def.attribution,
    ...(def.subdomains != null ? { subdomains: def.subdomains } : {}),
  })
