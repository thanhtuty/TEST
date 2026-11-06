import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import routes from "./routes/index.js"
const app = express()
import { connectDB } from "./config/db.js"
import { env } from "./config/env.js";
app.use(express.json())
// app.use(cors({ origin: env.CLIENT_URL }))
app.use("/api", routes)

const startServer= async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully")
    const server = app.listen(env.PORT, () => {
    console.log(`API health: http://localhost:${env.PORT}/api/health`)
  })
    server.on("error", (error) => {
      console.error("API server failed to start:", error.message)
      process.exit(1)
    })
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

startServer()
