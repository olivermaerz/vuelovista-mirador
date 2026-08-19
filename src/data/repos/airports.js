/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createAirportsRepo(db) {
  return {
    /** @returns {Promise<Record<string, unknown>[]>} */
    async listAll() {
      return db.select(
        'SELECT id, icao, iata, name, type, lat, lon, elev_ft, country, municipality FROM airports ORDER BY name',
      )
    },

    /**
     * @param {string} id
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async getById(id) {
      const rows = await db.select('SELECT * FROM airports WHERE id = ?', [id])
      return rows[0] ?? null
    },

    /**
     * @param {string} icao
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async getByIcao(icao) {
      const rows = await db.select(
        'SELECT * FROM airports WHERE upper(icao) = upper(?) LIMIT 1',
        [icao],
      )
      return rows[0] ?? null
    },

    /**
     * @param {{ south: number, west: number, north: number, east: number }} bbox
     * @returns {Promise<Record<string, unknown>[]>}
     */
    async findInBbox(bbox) {
      return db.select(
        `SELECT id, icao, iata, name, type, lat, lon, elev_ft
         FROM airports
         WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?
         ORDER BY name`,
        [bbox.south, bbox.north, bbox.west, bbox.east],
      )
    },
  }
}
