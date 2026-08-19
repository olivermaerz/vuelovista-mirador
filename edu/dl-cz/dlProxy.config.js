/**
 * Educational sample — not used by the default Mirador build.
 *
 * Vite / Node proxy for Databáze letišť tiles. Does **not** embed a provider
 * token; forwards `X-AUTH-TOKEN` from the browser (user-entered key).
 *
 * When enabling the czech plugin example, import this from vite / serve / routes
 * (see README.md in this folder).
 */
export const DL_PROXY_PREFIX = '/dl-proxy'
export const DL_UPSTREAM = 'https://www.dl.cz'

/** Vite `server.proxy` / `preview.proxy` entry. */
export const dlViteProxy = {
  [DL_PROXY_PREFIX]: {
    target: DL_UPSTREAM,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${DL_PROXY_PREFIX}`), ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        const token = req.headers['x-auth-token']
        if (typeof token === 'string' && token) {
          proxyReq.setHeader('X-AUTH-TOKEN', token)
        }
      })
    },
  },
}
