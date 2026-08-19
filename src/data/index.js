import { getRuntime } from '../platform/index.js'
import { runMigrations } from './migrations.js'
import { createAirportsRepo } from './repos/airports.js'
import { createAirspacesRepo } from './repos/airspaces.js'
import { createNavaidsRepo } from './repos/navaids.js'
import { createFrequenciesRepo } from './repos/frequencies.js'
import { createTracksRepo } from './repos/tracks.js'
import { createSettingsRepo } from './repos/settings.js'

/** @type {import('./types.js').DbAdapter | null} */
let adapter = null

/** @type {ReturnType<typeof buildRepos> | null} */
let repos = null

/**
 * @param {import('./types.js').DbAdapter} db
 */
const buildRepos = (db) => ({
  airports: createAirportsRepo(db),
  airspaces: createAirspacesRepo(db),
  navaids: createNavaidsRepo(db),
  frequencies: createFrequenciesRepo(db),
  tracks: createTracksRepo(db),
  settings: createSettingsRepo(db),
})

/**
 * Open (or return) the platform SQLite database and run migrations.
 * @returns {Promise<{ db: import('./types.js').DbAdapter, repos: ReturnType<typeof buildRepos> }>}
 */
export async function openDatabase() {
  if (adapter && repos) {
    return { db: adapter, repos }
  }

  const runtime = getRuntime()
  if (runtime === 'tauri') {
    const { openTauriDatabase } = await import('./adapters/tauri.js')
    adapter = await openTauriDatabase()
  } else if (runtime === 'capacitor') {
    const { openCapacitorDatabase } = await import('./adapters/capacitor.js')
    adapter = await openCapacitorDatabase()
  } else {
    const { openWebDatabase } = await import('./adapters/web.js')
    adapter = await openWebDatabase()
  }

  await runMigrations(adapter)
  repos = buildRepos(adapter)
  return { db: adapter, repos }
}

/**
 * @returns {ReturnType<typeof buildRepos> | null}
 */
export function getRepos() {
  return repos
}

/**
 * Close the open database (tests / shutdown).
 */
export async function closeDatabase() {
  if (adapter) {
    await adapter.close()
  }
  adapter = null
  repos = null
}

export { runMigrations } from './migrations.js'
