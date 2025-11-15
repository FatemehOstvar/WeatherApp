const { Pool } = require("pg");
require("dotenv");

const { DATABASE_URL } = process.env;
module.exports = new Pool({
  connectionString: DATABASE_URL,
})