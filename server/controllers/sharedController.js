const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearer || req.cookies?.accessToken || null;
  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    },
  );
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = bearer || req.cookies?.accessToken || null;
  req.user = { role: "spectator" };

  if (!token) return next();

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded;
      }

      return next();
    },
  );
}

module.exports = { authenticate, optionalAuth };
