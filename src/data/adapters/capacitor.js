/**
 * Capacitor native SQLite via @capacitor-community/sqlite.
 * @returns {Promise<import('../types.js').DbAdapter>}
 */
export async function openCapacitorDatabase() {
  const { CapacitorSQLite, SQLiteConnection } = await import(
    '@capacitor-community/sqlite'
  )
  const connection = new SQLiteConnection(CapacitorSQLite)
  const dbName = 'mirador'

  const isConn = (await connection.isConnection(dbName, false)).result
  const db = isConn
    ? await connection.retrieveConnection(dbName, false)
    : await connection.createConnection(dbName, false, 'no-encryption', 1, false)

  await db.open()

  /** @type {import('../types.js').DbAdapter} */
  return {
    async execute(sql, params = []) {
      await db.run(sql, params, false)
    },
    async select(sql, params = []) {
      const result = await db.query(sql, params)
      return /** @type {Record<string, unknown>[]} */ (result.values || [])
    },
    async close() {
      await db.close()
      await connection.closeConnection(dbName, false)
    },
  }
}
