/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createAirspacesRepo(db) {
  return {
    /** @returns {Promise<Record<string, unknown>[]>} */
    async listAll() {
      return db.select(
        'SELECT id, name, type, class, lower_raw, upper_raw, country FROM airspaces ORDER BY name',
      )
    },

    /**
     * @param {string} id
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async getById(id) {
      const rows = await db.select('SELECT * FROM airspaces WHERE id = ?', [id])
      return rows[0] ?? null
    },

    /**
     * @param {string} type
     * @returns {Promise<Record<string, unknown>[]>}
     */
    async listByType(type) {
      return db.select(
        'SELECT id, name, type, class, lower_raw, upper_raw, country, geojson FROM airspaces WHERE type = ?',
        [type],
      )
    },
  }
}
