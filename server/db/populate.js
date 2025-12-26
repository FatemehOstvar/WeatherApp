// populate.js
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: No PostgreSQL connection string provided.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function populate() {
  try {
    console.log("Starting database setup...");
    await pool.query("BEGIN");

    // Create enum type for roles (idempotent)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'roles'
        ) THEN
          CREATE TYPE roles AS ENUM ('admin', 'user', 'spectator');
        END IF;
      END $$;
    `);

    // Create users table (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users
      (
        id
        SERIAL
        PRIMARY
        KEY,
        username
        VARCHAR
      (
        50
      ) UNIQUE NOT NULL,
        first_name VARCHAR
      (
        50
      ) NOT NULL,
        last_name VARCHAR
      (
        50
      ) NOT NULL,
        password VARCHAR
      (
        255
      ) NOT NULL,
        role roles DEFAULT 'spectator' NOT NULL
        );
    `);

    // Create user_city table (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_city
      (
        user_id
        INTEGER
        REFERENCES
        users
      (
        id
      ) ON DELETE CASCADE,
        city_name VARCHAR
      (
        100
      ) NOT NULL,
        PRIMARY KEY
      (
        user_id,
        city_name
      )
        );
    `);

    // If you are sure the PK is defined above, you do NOT need this:
    // await pool.query(`
    //   ALTER TABLE user_city
    //   ADD PRIMARY KEY (user_id, city_name);
    // `);

    await pool.query("COMMIT");
    console.log("Database setup completed successfully.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error during database setup:", error);
  } finally {
    await pool.end();
  }
}

populate();
