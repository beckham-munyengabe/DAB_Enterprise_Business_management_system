import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the HTTP server.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 DAB Enterprise API running on http://localhost:${PORT}`);
  });
});
