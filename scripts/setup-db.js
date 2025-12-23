import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "../server/db/client.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
  const schemaPath = path.join(__dirname, "..", "server", "db", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await pool.query(sql);
}

async function seed() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  await pool.query(
    `
      insert into users (email, password_hash, first_name, last_name)
      values ($1, $2, $3, $4)
      on conflict (email) do update
      set password_hash = excluded.password_hash,
          first_name = excluded.first_name,
          last_name = excluded.last_name
    `,
    ["demo@weatherclub.dev", passwordHash, "Demo", "Account"],
  );
}

async function main() {
  await applySchema();
  await seed();
  console.log("Database schema applied and demo user ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
