/**
 * Desktop SQLite via tauri-plugin-sql.
 * @returns {Promise<import('../types.js').DbAdapter>}
 */
export async function openTauriDatabase() {
  const Database = (await import('@tauri-apps/plugin-sql')).default
  const db = await Database.load('sqlite:mirador.db')

  /** @type {import('../types.js').DbAdapter} */
  return {
    async execute(sql, params = []) {
      await db.execute(sql, params)
    },
    async select(sql, params = []) {
      return /** @type {Record<string, unknown>[]} */ (
        await db.select(sql, params)
      )
    },
    async close() {
      await db.close()
    },
  }
}
