import jwt from "jsonwebtoken";
import { pool } from "../db/client.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing." });
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `
        select id, email, first_name, last_name, created_at
        from users
        where id = $1
        limit 1
      `,
      [payload.userId],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      createdAt: result.rows[0].created_at,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
