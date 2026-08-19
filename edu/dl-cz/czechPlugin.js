/**
 * Educational example: chart plugin that requires a user-supplied API key.
 *
 * NOT registered in the live app. To try it, follow `edu/dl-cz/README.md`.
 *
 * Imports assume this file has been copied to `src/maps/plugins/czech.js`.
 */

import { TransparentJpegLayer } from '../leaflet/TransparentJpegLayer.js'
import { LayerPriority } from '../layerPriority.js'
import { getChartApiKey } from '../licensedCharts.js'

/** Must match `DL_PROXY_PREFIX` in `edu/dl-cz/dlProxy.config.js` once that proxy is wired. */
const DL_PROXY_PREFIX = '/dl-proxy'

/** Provider site / product page (substitute official terms URL when you have one). */
export const DL_LICENSE_TERMS_URL = 'https://www.dl.cz/'

/** Leaflet XYZ template — note DL.cz uses {z}/{y}/{x}, not {z}/{x}/{y}. */
export const DL_TILE_TEMPLATE = `${DL_PROXY_PREFIX}/api/resources/tile/{z}/{y}/{x}`

/** @type {import('../types.js').MapPlugin} */
export const czechPlugin = {
  id: 'czech',
  label: 'DL.cz Czechia VFR',
  defaultActive: false,
  priority: LayerPriority.CHART,
  group: 'charts',
  licenseTermsUrl: DL_LICENSE_TERMS_URL,
  requiresLicense: {
    provider: 'Databáze letišť (DL.cz)',
    summary:
      'Educational example of a chart layer that needs a provider API key. Only enable if you have permission from Databáze letišť to use their tile API, and paste the key they issued (or that their client uses).',
    requiresApiKey: true,
    apiKeyLabel: 'DL.cz API key (X-AUTH-TOKEN)',
    apiKeyHelp:
      'Stored only in this browser/app profile. Mirador does not ship a DL.cz key.',
  },
  createLayer: (_map, { pane }) =>
    new TransparentJpegLayer(DL_TILE_TEMPLATE, {
      pane,
      minZoom: 6,
      maxZoom: 13,
      opacity: 1,
      bounds: [
        [47.7, 12.0],
        [51.1, 22.7],
      ],
      attribution: '&copy; <a href="https://www.dl.cz/">Databáze letišť</a>',
      fetchHeaders: () => {
        const apiKey = getChartApiKey('czech')
        return apiKey ? { 'X-AUTH-TOKEN': apiKey } : undefined
      },
    }),
}
