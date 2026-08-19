/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createFrequenciesRepo(db) {
  return {
    /**
     * @param {string} airportId
     * @returns {Promise<Record<string, unknown>[]>}
     */
    async listForAirport(airportId) {
      return db.select(
        `SELECT id, airport_id, type, mhz, name, stream_key
         FROM frequencies
         WHERE airport_id = ?
         ORDER BY type, mhz`,
        [airportId],
      )
    },

    /**
     * @param {string} id
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async getById(id) {
      const rows = await db.select('SELECT * FROM frequencies WHERE id = ?', [id])
      return rows[0] ?? null
    },
  }
}
