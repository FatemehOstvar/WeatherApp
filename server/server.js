import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { ensureDatabaseConnection } from "./db/client.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((value) => value.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const dbOk = await ensureDatabaseConnection();
    res.json({ status: "ok", database: dbOk });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.listen(port, () => {
  console.log(`API ready on port ${port}`);
});
