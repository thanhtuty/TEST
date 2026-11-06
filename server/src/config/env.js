import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};

if (!env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env");
}