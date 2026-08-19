export const ADSBLOL_PROXY_PREFIX = '/adsblol-proxy'
export const ADSBLOL_UPSTREAM = 'https://api.adsb.lol'

/** Vite `server.proxy` / `preview.proxy` entry. */
export const adsblolViteProxy = {
  [ADSBLOL_PROXY_PREFIX]: {
    target: ADSBLOL_UPSTREAM,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${ADSBLOL_PROXY_PREFIX}`), ''),
  },
}
