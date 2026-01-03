const { Pool } = require("pg");

require("dotenv").config({ path: "server/.env" });
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL env var");
}

module.exports.pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
