export const ADSBDB_PROXY_PREFIX = '/adsbdb-proxy'
export const ADSBDB_UPSTREAM = 'https://api.adsbdb.com'

/** Vite `server.proxy` / `preview.proxy` entry. */
export const adsbdbViteProxy = {
  [ADSBDB_PROXY_PREFIX]: {
    target: ADSBDB_UPSTREAM,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${ADSBDB_PROXY_PREFIX}`), ''),
  },
}
