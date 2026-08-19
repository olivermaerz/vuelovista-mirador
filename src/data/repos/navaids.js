/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createNavaidsRepo(db) {
  return {
    /** @returns {Promise<Record<string, unknown>[]>} */
    async listAll() {
      return db.select(
        'SELECT id, ident, name, type, freq_mhz, lat, lon, elev_ft, country FROM navaids ORDER BY ident',
      )
    },

    /**
     * @param {string} id
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async getById(id) {
      const rows = await db.select('SELECT * FROM navaids WHERE id = ?', [id])
      return rows[0] ?? null
    },

    /**
     * @param {{ south: number, west: number, north: number, east: number }} bbox
     * @returns {Promise<Record<string, unknown>[]>}
     */
    async findInBbox(bbox) {
      return db.select(
        `SELECT id, ident, name, type, freq_mhz, lat, lon
         FROM navaids
         WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?
         ORDER BY ident`,
        [bbox.south, bbox.north, bbox.west, bbox.east],
      )
    },
  }
}
