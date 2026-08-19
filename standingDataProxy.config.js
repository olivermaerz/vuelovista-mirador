export const STANDING_DATA_PROXY_PREFIX = '/standing-data-proxy'
export const STANDING_DATA_UPSTREAM = 'https://vrs-standing-data.adsb.lol'

/** Vite `server.proxy` / `preview.proxy` entry. */
export const standingDataViteProxy = {
  [STANDING_DATA_PROXY_PREFIX]: {
    target: STANDING_DATA_UPSTREAM,
    changeOrigin: true,
    rewrite: (path) =>
      path.replace(new RegExp(`^${STANDING_DATA_PROXY_PREFIX}`), ''),
  },
}
