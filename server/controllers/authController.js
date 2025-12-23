import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/client.js";

const TOKEN_TTL = "7d";

function createToken(userId, email) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign({ userId, email }, secret, { expiresIn: TOKEN_TTL });
}

function buildUserResponse(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: row.created_at,
  };
}

export async function signup(req, res) {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existing = await pool.query("select 1 from users where email = $1", [
    email.toLowerCase(),
  ]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: "A user with that email exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inserted = await pool.query(
    `
      insert into users (email, password_hash, first_name, last_name)
      values ($1, $2, $3, $4)
      returning *
    `,
    [email.toLowerCase(), passwordHash, firstName.trim(), lastName.trim()],
  );

  const user = buildUserResponse(inserted.rows[0]);
  const token = createToken(user.id, user.email);
  return res.status(201).json({ user, token });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const result = await pool.query(
    "select * from users where email = $1 limit 1",
    [email.toLowerCase()],
  );
  if (result.rowCount === 0) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const [userRow] = result.rows;
  const isValid = await bcrypt.compare(password, userRow.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const user = buildUserResponse(userRow);
  const token = createToken(user.id, user.email);

  return res.json({ user, token });
}

export function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Missing user context." });
  }

  return res.json({ user: req.user });
}
