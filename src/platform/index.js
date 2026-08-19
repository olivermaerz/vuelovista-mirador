/**
 * Runtime shells: web (Vite), Capacitor (iOS/Android), Tauri (desktop).
 * @typedef {'web' | 'capacitor' | 'tauri'} AppRuntime
 */

/**
 * @returns {AppRuntime}
 */
export function getRuntime() {
  if (typeof window === 'undefined') return 'web'

  // Tauri 2 exposes __TAURI_INTERNALS__; older builds used __TAURI__.
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) return 'tauri'

  const cap = window.Capacitor
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return 'capacitor'
  }

  return 'web'
}

/** @returns {boolean} */
export function isNative() {
  const runtime = getRuntime()
  return runtime === 'capacitor' || runtime === 'tauri'
}

/** @returns {boolean} */
export function isWeb() {
  return getRuntime() === 'web'
}
