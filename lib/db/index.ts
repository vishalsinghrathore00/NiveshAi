import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as schema from "./schema"

let pool: Pool | null = null
let database: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDb() {
  if (!database) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    pool = new Pool({ connectionString })
    database = drizzle(pool, { schema })
  }
  return database
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop]
  },
})

export * from "./schema"
