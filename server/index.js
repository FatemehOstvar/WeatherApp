const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
require("dotenv").config({ path: __dirname + "/.env" });

const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "OPTIONS"], //, "PUT", "PATCH", "DELETE"
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
const { settingsRouter } = require("./routers/settingsRouter");
const { adminRouter } = require("./routers/admin");
const { userRouter } = require("./routers/members");
const authRouter = require("./routers/auth");
// const { join } = require("node:path");

const port = process.env.PORT;
app.use("/api/auth", authRouter);
// some spaghetti
const { optionalAuth } = require("./controllers/sharedController");

app.get("/api/role", optionalAuth, (req, res) => {
  res.json({ role: req.user.role });
});
app.get("/api/key", (req, res) => {
  res.json({ key: process.env.KEY });
});
//
const citiesRouter = require("./routers/cities");
const validateCity = require("./routers/validateCity");
app.use("/api/settings", settingsRouter);
app.use("/api/validateCity", validateCity);
app.use("/api/cities", citiesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
// app.use("/api/", spectatorRouter);

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
