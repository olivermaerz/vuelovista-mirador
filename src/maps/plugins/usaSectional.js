import L from 'leaflet'
import { LayerPriority } from '../layerPriority.js'

/** @type {import('../types.js').MapPlugin} */
export const usaSectionalPlugin = {
  id: 'usa-sectional',
  label: 'FAA USA VFR',
  defaultActive: false,
  priority: LayerPriority.CHART,
  group: 'charts',
  createLayer: (_map, { pane }) =>
    L.tileLayer(
      'https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/VFR_Sectional/MapServer/tile/{z}/{y}/{x}',
      {
        pane,
        minZoom: 8,
        maxZoom: 12,
        maxNativeZoom: 12,
        opacity: 1,
        bounds: [
          [15, -180],
          [72, -50],
        ],
        attribution:
          '&copy; <a href="https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/vfr/">FAA Aeronautical Information Services</a>',
      },
    ),
}
