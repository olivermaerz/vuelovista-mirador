import { getRuntime } from '../platform/index.js'
import { resolveProxyRequest } from './routes.js'

/**
 * @typedef {Object} HttpFetchOptions
 * @property {AbortSignal} [signal]
 * @property {Record<string, string>} [headers]
 * @property {string} [method]
 * @property {BodyInit | null} [body]
 * @property {'text' | 'arraybuffer' | 'json' | 'blob'} [responseType]
 *   Capacitor native hint. Default `text` (JSON APIs). Use `arraybuffer` for tiles/binary.
 */

/**
 * Normalize CapacitorHttp `data` into something `fetch.Response` can wrap.
 * Native iOS often returns: parsed JSON objects, plain JSON strings, or base64
 * for arraybuffer — never assume one shape.
 *
 * @param {unknown} data
 * @param {string} responseType
 * @returns {BodyInit}
 */
function capacitorDataToBodyInit(data, responseType) {
  if (data == null) return ''

  // Already-parsed JSON (common when Content-Type is application/json)
  if (
    typeof data === 'object' &&
    !(data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data)
  ) {
    return JSON.stringify(data)
  }

  if (typeof data === 'string') {
    const trimmed = data.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return data
    }

    if (responseType === 'arraybuffer' || responseType === 'blob') {
      try {
        const binary = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
        // Base64 of a JSON payload → prefer text so Response.json() is reliable
        const asText = new TextDecoder().decode(binary)
        const t = asText.trimStart()
        if (t.startsWith('{') || t.startsWith('[')) return asText
        return binary
      } catch {
        return data
      }
    }

    return data
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return /** @type {BodyInit} */ (data)
  }

  return String(data)
}

/**
 * @param {string} url
 * @param {HttpFetchOptions} [options]
 * @returns {Promise<Response>}
 */
async function fetchViaCapacitor(url, options = {}) {
  const { CapacitorHttp } = await import('@capacitor/core')
  const resolved = resolveProxyRequest(url)
  const target = resolved?.upstreamUrl ?? url
  const headers = {
    ...(resolved?.headers || {}),
    ...(options.headers || {}),
  }
  const responseType = options.responseType || 'text'

  const response = await CapacitorHttp.request({
    url: target,
    method: (options.method || 'GET').toUpperCase(),
    headers,
    responseType,
    data: options.body,
  })

  const body = capacitorDataToBodyInit(response.data, responseType)

  return new Response(body, {
    status: response.status || 200,
    headers: response.headers || {},
  })
}

/**
 * Cross-runtime fetch. Proxy paths (`/adsblol-proxy`, `/adsbdb-proxy`,
 * `/standing-data-proxy`) stay relative on web (Vite / serve.mjs). On
 * Capacitor they are rewritten to upstream hosts; request headers
 * (e.g. user-entered API keys) are forwarded.
 *
 * @param {string} url
 * @param {HttpFetchOptions} [options]
 * @returns {Promise<Response>}
 */
export async function httpFetch(url, options = {}) {
  const runtime = getRuntime()

  if (runtime === 'capacitor') {
    return fetchViaCapacitor(url, options)
  }

  // Web: same-origin proxies inject headers server-side.
  return fetch(url, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    signal: options.signal,
  })
}
