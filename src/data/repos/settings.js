/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createSettingsRepo(db) {
  return {
    /**
     * @param {string} key
     * @returns {Promise<string | null>}
     */
    async get(key) {
      const rows = await db.select('SELECT value FROM settings WHERE key = ?', [
        key,
      ])
      const value = rows[0]?.value
      return typeof value === 'string' ? value : null
    },

    /**
     * @param {string} key
     * @param {string} value
     */
    async set(key, value) {
      await db.execute(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, value],
      )
    },

    /**
     * @param {string} key
     */
    async remove(key) {
      await db.execute('DELETE FROM settings WHERE key = ?', [key])
    },
  }
}
