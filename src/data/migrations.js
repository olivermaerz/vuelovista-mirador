import schemaSql from './schema.sql?raw'

/** @type {{ version: number, name: string, sql: string }[]} */
export const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    sql: schemaSql,
  },
]

/**
 * Split a SQL script into executable statements.
 * Strips `--` line comments first so semicolons inside comments cannot break parsing.
 * @param {string} sql
 * @returns {string[]}
 */
export function splitSqlStatements(sql) {
  const withoutLineComments = sql
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('--')) return ''
      const commentAt = line.indexOf('--')
      return commentAt >= 0 ? line.slice(0, commentAt) : line
    })
    .join('\n')

  return withoutLineComments
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0)
}

/**
 * @param {import('./types.js').DbAdapter} db
 */
export async function runMigrations(db) {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  )

  const applied = await db.select('SELECT version FROM schema_migrations')
  const appliedSet = new Set(applied.map((row) => Number(row.version)))

  for (const migration of migrations) {
    if (appliedSet.has(migration.version)) continue
    for (const stmt of splitSqlStatements(migration.sql)) {
      // schema.sql also creates schema_migrations — skip redundant create
      if (/^CREATE TABLE IF NOT EXISTS schema_migrations\b/i.test(stmt)) continue
      await db.execute(stmt)
    }
    await db.execute('INSERT INTO schema_migrations (version) VALUES (?)', [
      migration.version,
    ])
  }
}
