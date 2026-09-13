/**
 * Runtime shells: web (Vite) and Capacitor (iOS/Android).
 * @typedef {'web' | 'capacitor'} AppRuntime
 */

/**
 * @returns {AppRuntime}
 */
export function getRuntime() {
  if (typeof window === 'undefined') return 'web'

  const cap = window.Capacitor
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return 'capacitor'
  }

  return 'web'
}

/** @returns {boolean} */
export function isNative() {
  return getRuntime() === 'capacitor'
}

/** @returns {boolean} */
export function isWeb() {
  return getRuntime() === 'web'
}
