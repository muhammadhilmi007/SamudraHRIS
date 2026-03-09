/**
 * ============================================================
 * SamudraHRD — Database Configuration
 * ============================================================
 * Mongoose connection with retry logic.
 * Max 5 retries, 5-second interval between attempts.
 * ============================================================
 */

const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 detik

let retryCount = 0;

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/samudrahrd";

  try {
    await mongoose.connect(MONGODB_URI);
    retryCount = 0; // Reset retry count on successful connection
  } catch (error) {
    retryCount++;
    console.error(
      `[DB] ❌ Connection failed (attempt ${retryCount}/${MAX_RETRIES}):`,
      error.message,
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`[DB] 🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      setTimeout(connectDB, RETRY_INTERVAL);
    } else {
      console.error(
        "[DB] 🚫 Max retries reached. Could not connect to MongoDB.",
      );
      process.exit(1);
    }
  }
};

// ============================================================
// Mongoose Connection Event Listeners
// ============================================================

mongoose.connection.on("connected", () => {
  console.log("[DB] ✅ MongoDB connected successfully");
  console.log(`[DB] 📦 Database: ${mongoose.connection.name}`);
});

mongoose.connection.on("error", (err) => {
  console.error("[DB] ❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] ⚠️  MongoDB disconnected");
});

// Graceful shutdown handler
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[DB] 🔌 MongoDB connection closed (app termination)");
  process.exit(0);
});

module.exports = { connectDB };
