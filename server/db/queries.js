async function getSettings() {
  return { setting: "THIS IS TO BE FETCHED FROM THE DB" };
}

const bcrypt = require("bcryptjs");
const { pool } = require("./pool");

/**
 * Create user
 */
async function addUser({
  username,
  firstName,
  lastName,
  role = "spectator",
  password,
}) {
  console.log("Adding user...");
  console.log(typeof password);
  const hash = await bcrypt.hash(password, 10);

  console.log(typeof hash);
  const result = await pool.query(
    `
      INSERT INTO users (username, first_name, last_name, password, role)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, username, first_name, last_name, role
    `,
    [username, firstName, lastName, hash, role],
  );

  return result.rows[0];
}

/**
 * Used for login (needs password hash)
 */
async function findByUsername(username) {
  const result = await pool.query(
    `
      SELECT id, username, first_name, last_name, password, role
      FROM users
      WHERE username = $1
    `,
    [username],
  );

  return result.rows[0] || null;
}

/**
 * Used only to check existence (fast path)
 */
async function checkUserExists(username) {
  const result = await pool.query(
    `
      SELECT 1
      FROM users
      WHERE username = $1
    `,
    [username],
  );

  return result.rowCount > 0;
}

/**
 * Used after JWT verification
 */
async function findById(id) {
  const result = await pool.query(
    `
      SELECT id, username, first_name, last_name, role
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

/**
 * Upgrade spectator → user
 */
async function upgradeRole(userId) {
  const result = await pool.query(
    `
      UPDATE users
      SET role = 'user'
      WHERE id = $1
        AND role = 'spectator' RETURNING id, username, first_name, last_name, role
    `,
    [userId],
  );

  return result.rows[0] || null;
}

// in db/queries.js (append or merge with existing exports)
async function addUserCity(userId, cityName) {
  const result = await pool.query(
    `
      INSERT INTO user_city (user_id, city_name)
      VALUES ($1, $2) ON CONFLICT (user_id, city_name) DO NOTHING
    RETURNING user_id, city_name
    `,
    [userId, cityName],
  );
  return result.rows[0] || null;
}

async function getAllCities(user_id) {
  const result = await pool.query(
    `
      SELECT city_name
      FROM user_city
             JOIN users ON user_city.user_id = users.id
      WHERE user_id = $1
      ORDER BY city_name ASC
    `,
    [user_id],
  );
  return result.rows; // [{ city_name: '...' }, ...]
}

module.exports = {
  addUser,
  findByUsername,
  checkUserExists,
  getSettings,
  addUserCity,
  getAllCities,
  upgradeRole,
};
