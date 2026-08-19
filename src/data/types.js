/**
 * @typedef {Object} DbRow
 * @property {unknown} [key]
 */

/**
 * Minimal SQL adapter shared by web / Capacitor / Tauri.
 * @typedef {Object} DbAdapter
 * @property {(sql: string, params?: unknown[]) => Promise<void>} execute
 * @property {(sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]>} select
 * @property {() => Promise<void>} close
 */

export {}
