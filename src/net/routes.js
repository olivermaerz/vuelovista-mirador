import {
  ADSBLOL_PROXY_PREFIX,
  ADSBLOL_UPSTREAM,
} from '../../adsblolProxy.config.js'
import {
  ADSBDB_PROXY_PREFIX,
  ADSBDB_UPSTREAM,
} from '../../adsbdbProxy.config.js'
import {
  STANDING_DATA_PROXY_PREFIX,
  STANDING_DATA_UPSTREAM,
} from '../../standingDataProxy.config.js'

/**
 * @typedef {'adsblol' | 'adsbdb' | 'standing-data'} ProxyKind
 */

/**
 * @typedef {Object} ResolvedProxyRequest
 * @property {ProxyKind} kind
 * @property {string} upstreamUrl Absolute upstream URL
 * @property {Record<string, string>} headers Extra request headers
 * @property {string} proxyPath Original same-origin path (e.g. /adsblol-proxy/…)
 */

const ROUTES = [
  {
    kind: /** @type {ProxyKind} */ ('adsblol'),
    prefix: ADSBLOL_PROXY_PREFIX,
    upstream: ADSBLOL_UPSTREAM,
    headers: {},
  },
  {
    kind: /** @type {ProxyKind} */ ('adsbdb'),
    prefix: ADSBDB_PROXY_PREFIX,
    upstream: ADSBDB_UPSTREAM,
    headers: {},
  },
  {
    kind: /** @type {ProxyKind} */ ('standing-data'),
    prefix: STANDING_DATA_PROXY_PREFIX,
    upstream: STANDING_DATA_UPSTREAM,
    headers: {},
  },
]

/**
 * @param {string} pathOrUrl
 * @returns {ResolvedProxyRequest | null}
 */
export function resolveProxyRequest(pathOrUrl) {
  let pathname = pathOrUrl
  try {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      pathname = new URL(pathOrUrl).pathname + new URL(pathOrUrl).search
    }
  } catch {
    pathname = pathOrUrl
  }

  for (const route of ROUTES) {
    if (!pathname.startsWith(route.prefix)) continue
    const rest = pathname.slice(route.prefix.length) || '/'
    return {
      kind: route.kind,
      upstreamUrl: `${route.upstream}${rest}`,
      headers: { ...route.headers },
      proxyPath: pathname.startsWith('/') ? pathname : `/${pathname}`,
    }
  }
  return null
}

export {
  ADSBLOL_PROXY_PREFIX,
  ADSBLOL_UPSTREAM,
  ADSBDB_PROXY_PREFIX,
  ADSBDB_UPSTREAM,
  STANDING_DATA_PROXY_PREFIX,
  STANDING_DATA_UPSTREAM,
}
