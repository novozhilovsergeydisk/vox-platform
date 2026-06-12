import { Pool } from 'pg'

const globalForPool = globalThis as unknown as {
  dbPool: Pool | undefined
}

export const db =
  globalForPool.dbPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

if (process.env.NODE_ENV !== 'production') globalForPool.dbPool = db

export const query = (text: string, params?: any[]) => db.query(text, params)

export default db
