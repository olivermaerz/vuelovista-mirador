/**
 * Educational example: chart plugin that requires provider approval (no API key).
 *
 * NOT registered in the live app. To try it, follow `edu/dfs/README.md`.
 *
 * Imports assume this file has been copied to `src/maps/plugins/dfs.js`.
 */

import L from 'leaflet'
import { LayerPriority } from '../layerPriority.js'

/** DFS AIS portal disclaimer / terms of use. */
export const DFS_LICENSE_TERMS_URL =
  'https://secais.dfs.de/pilotservice/service/information/disclaimer/disclaimer.jsp'

/** @type {import('../types.js').MapPlugin} */
export const dfsPlugin = {
  id: 'dfs',
  label: 'DFS Germany VFR',
  defaultActive: false,
  priority: LayerPriority.CHART,
  group: 'charts',
  licenseTermsUrl: DFS_LICENSE_TERMS_URL,
  requiresLicense: {
    provider: 'DFS Deutsche Flugsicherung GmbH',
    summary:
      'DFS AIS portal terms restrict chart use on third-party sites and require prior written approval. Commercial use of chart material is not permitted without a licence.',
  },
  createLayer: (_map, { pane }) =>
    L.tileLayer('https://secais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png', {
      pane,
      minZoom: 5,
      maxZoom: 12,
      opacity: 1,
      bounds: [
        [47.2, 5.8],
        [55.1, 15.1],
      ],
      attribution: '&copy; DFS Deutsche Flugsicherung GmbH',
    }),
}
