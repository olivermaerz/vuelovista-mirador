import { TransparentJpegLayer } from '../leaflet/TransparentJpegLayer.js'
import { LayerPriority } from '../layerPriority.js'
import { getChartApiKey } from '../licensedCharts.js'

/** IGN Géoservices licence / CGU page (SCAN OACI). */
export const IGN_LICENSE_TERMS_URL = 'https://geoservices.ign.fr/cgu-licences'

const FRANCE_WMTS_TEMPLATE =
  'https://data.geopf.fr/private/wmts?' +
  'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
  '&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI' +
  '&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM' +
  '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'

/** @type {import('../types.js').MapPlugin} */
export const francePlugin = {
  id: 'france',
  label: 'IGN France VFR',
  defaultActive: false,
  priority: LayerPriority.CHART,
  group: 'charts',
  licenseTermsUrl: IGN_LICENSE_TERMS_URL,
  requiresLicense: {
    provider: 'IGN / SIA (SCAN OACI)',
    summary:
      'SCAN OACI is not open data. Professional/associative use needs an IGN licence; consumer or commercial redistribution may require a royalty. Enter the API key from your IGN account to enable this layer.',
    requiresApiKey: true,
    apiKeyLabel: 'IGN API key',
    apiKeyHelp:
      'From your IGN / cartes.gouv.fr (or Géoservices) account that is licensed for SCAN OACI.',
  },
  createLayer: (_map, { pane }) => {
    const layer = new TransparentJpegLayer(FRANCE_WMTS_TEMPLATE, {
      pane,
      minZoom: 6,
      maxZoom: 11,
      opacity: 1,
      bounds: [
        [41.0, -5.8],
        [51.5, 10.2],
      ],
      attribution:
        '&copy; <a href="https://www.geoportail.gouv.fr/donnees/carte-oaci-vfr">IGN / SIA</a>',
    })

    const baseGetTileUrl = layer.getTileUrl.bind(layer)
    layer.getTileUrl = (coords) => {
      const url = baseGetTileUrl(coords)
      const apiKey = getChartApiKey('france')
      if (!apiKey) return url
      const sep = url.includes('?') ? '&' : '?'
      return `${url}${sep}apikey=${encodeURIComponent(apiKey)}`
    }

    return layer
  },
}
