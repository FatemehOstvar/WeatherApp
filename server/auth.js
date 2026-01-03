const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("./db/queries");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT;
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type"], //not needed , "Authorization"
  }),
);

let refreshTokens = []; // demo-only (in-memory)

const validateUser = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha()
    .withMessage("First name should only consist of alphabets")
    .isLength({ min: 2, max: 20 })
    .withMessage("First name should have between 2 and 20 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha()
    .withMessage("Last name should only consist of alphabets")
    .isLength({ min: 3, max: 20 })
    .withMessage("Last name should have between 3 and 20 characters"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one symbol"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long")
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers"),
];

function setAuthCookies(res, accessToken, refreshToken) {
  const common = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, {
    ...common,
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    ...common,
    path: "/token",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

const register = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const alreadyExist = await db.checkUserExists(req.body.username);
      if (alreadyExist) {
        return res.status(409).json({ msg: "Username exists" });
      }

      await db.addUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
      });

      const user = await db.findByUsername(req.body.username);
      await db.upgradeRole(user.id);

      if (!user) {
        return res.status(500).json({ msg: "Unable to create user" });
      }

      const payload = { id: user.id, username: user.username, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN);
      refreshTokens.push(refreshToken);
      //TODO set cookie
      setAuthCookies(res, accessToken, refreshToken);
      return res.json({
        msg: "Successfully registered user",
      });
    } catch (err) {
      return next(err);
    }
  },
];

async function logIn(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(401).json({ msg: "Missing credentials" });
    }

    const user = await db.findByUsername(username);
    if (!user) {
      return res.status(404).json({ msg: "No user found with this username" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN);
    refreshTokens.push(refreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    return res.json({ msg: "successfully logged in" });
  } catch (err) {
    return next(err);
  }
}

//TODO make this automatic in front end req
// Refresh access token using refresh token

app.post("/token", (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).json({ msg: "Missing refresh token" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ msg: "Refresh token invalid" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: "Refresh token expired" });
    }

    const user = await db.findByUsername(decoded.username);
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    // TODO save access token in cookie
    setAuthCookies(res, accessToken, refreshToken);
    return res.json({ msg: "token generated" });
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
    algorithm: "HS256",
  });
}

app.post("/register", ...register);
app.post("/login", logIn);

app.post("/token/logout", (req, res) => {
  const refreshToken = req.cookie["refreshToken"];
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/token" });

  return res.sendStatus(204);
});

// Optional: basic error handler so next(err) returns JSON
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ msg: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
