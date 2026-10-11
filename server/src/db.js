// db.js: shared Postgres pool and query helper
import pg from "pg";

// One pool of reusable connections for the whole server
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Every route calls this. text = SQL with $1, $2 placeholders; params = the values (sent separately, so no SQL injection)
export function query(text, params) {
    return pool.query(text, params);
}
