import L from 'leaflet'
import { LayerPriority } from '../layerPriority.js'

const AUSTRIA_VFR_LAYERS = [
  'FIR',
  'CTA',
  'CTR',
  'TMA',
  'MCTR',
  'MTMA',
  'MATZ',
  'R',
  'D',
  'TRA',
  'RAS-MTA',
  'RAS-GLD',
  'RAS-HPG',
  'RAS-PARA',
  'RAS-RMZ',
  'RAS-TMZ',
  'AD',
  'ASA',
  'FIS',
  'VFR_REPP',
  'OBSTACLES_ENR',
  'NATIONALPARKS',
  'MODEL_AF',
  'MAX_ELEV_FIGURES',
  'VOR_DME',
  'NDB',
  'DME',
].join(',')

/** @type {import('../types.js').MapPlugin} */
export const austriaPlugin = {
  id: 'austria',
  label: 'ACG Austria VFR',
  defaultActive: false,
  priority: LayerPriority.CHART,
  group: 'charts',
  createLayer: (_map, { pane }) =>
    L.tileLayer.wms('https://sdigeo-free.austrocontrol.at/geoserver/free/wms', {
      pane,
      layers: AUSTRIA_VFR_LAYERS,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      opacity: 1,
      bounds: [
        [46.3, 9.4],
        [49.1, 17.3],
      ],
      attribution:
        '&copy; <a href="https://maps.austrocontrol.at/mapstore/#/viewer/121">Austro Control</a>',
    }),
}
