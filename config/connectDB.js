const { Pool } = require("pg");
require("dotenv").config();

// Supabase requires SSL. rejectUnauthorized: false is the standard setting
// for Supabase's pooler/direct connections since they use a Supabase-managed
// certificate that Node's default CA bundle doesn't already trust.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

const db = {
  // Preserves the calling convention the rest of the app already uses:
  //   const rows = await db.query(sql, params);   // rows is a plain array
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
};

module.exports = db;
