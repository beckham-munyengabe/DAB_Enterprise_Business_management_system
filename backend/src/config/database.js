import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connects to MongoDB using Mongoose (the ODM / "M" data access layer).
export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dab_enterprise";
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri);
    console.log("✅ MongoDB connected:", conn.connection.name);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   Check your backend/.env MONGO_URI value.");
    process.exit(1);
  }
}

export default mongoose;
