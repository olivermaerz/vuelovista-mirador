/**
 * Web SQLite via wasm + JsStorageDb (localStorage-backed, no COOP/COEP).
 * Suitable for settings/tracks foundation; large reference dumps should use
 * native SQLite on Capacitor/Tauri or a later OPFS worker.
 * @returns {Promise<import('../types.js').DbAdapter>}
 */
export async function openWebDatabase() {
  const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default
  const sqlite3 = await sqlite3InitModule({
    print: () => {},
    printErr: console.error,
  })

  // Dedicated kvvfs slot so we don't collide with other apps/pages.
  const db = new sqlite3.oo1.JsStorageDb('mirador')

  /** @type {import('../types.js').DbAdapter} */
  return {
    async execute(sql, params = []) {
      db.exec({ sql, bind: params })
    },
    async select(sql, params = []) {
      /** @type {Record<string, unknown>[]} */
      const rows = []
      db.exec({
        sql,
        bind: params,
        rowMode: 'object',
        callback: (row) => {
          rows.push(/** @type {Record<string, unknown>} */ (row))
        },
      })
      return rows
    },
    async close() {
      db.close()
    },
  }
}
