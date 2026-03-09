import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction | null = null

export function getSQL() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Please add it in the Vars section of the sidebar.'
      )
    }
    _sql = neon(url)
  }
  return _sql
}
