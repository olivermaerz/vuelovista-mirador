/**
 * @param {import('../types.js').DbAdapter} db
 */
export function createTracksRepo(db) {
  return {
    /** @returns {Promise<Record<string, unknown>[]>} */
    async listSessions() {
      return db.select(
        'SELECT id, started_at, ended_at, label FROM track_sessions ORDER BY started_at DESC',
      )
    },

    /**
     * @param {{ id: string, startedAt: string, label?: string }} session
     */
    async createSession(session) {
      await db.execute(
        'INSERT INTO track_sessions (id, started_at, label) VALUES (?, ?, ?)',
        [session.id, session.startedAt, session.label ?? null],
      )
    },

    /**
     * @param {string} sessionId
     * @param {string} endedAt
     */
    async endSession(sessionId, endedAt) {
      await db.execute(
        'UPDATE track_sessions SET ended_at = ? WHERE id = ?',
        [endedAt, sessionId],
      )
    },

    /**
     * @param {{ sessionId: string, ts: string, lat: number, lon: number, altFt?: number, gsKt?: number, headingDeg?: number, source?: string }} point
     */
    async appendPoint(point) {
      await db.execute(
        `INSERT INTO track_points (session_id, ts, lat, lon, alt_ft, gs_kt, heading_deg, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          point.sessionId,
          point.ts,
          point.lat,
          point.lon,
          point.altFt ?? null,
          point.gsKt ?? null,
          point.headingDeg ?? null,
          point.source ?? 'gps',
        ],
      )
    },

    /**
     * @param {string} sessionId
     * @returns {Promise<Record<string, unknown>[]>}
     */
    async listPoints(sessionId) {
      return db.select(
        `SELECT id, session_id, ts, lat, lon, alt_ft, gs_kt, heading_deg, source
         FROM track_points
         WHERE session_id = ?
         ORDER BY ts`,
        [sessionId],
      )
    },
  }
}
