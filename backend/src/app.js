import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// ----- Global middleware -----
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ----- Health check -----
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "DAB Enterprise API",
    version: "1.0.0",
  });
});

// ----- API routes -----
app.use("/api", routes);

// ----- Error handling -----
app.use(notFound);
app.use(errorHandler);

export default app;