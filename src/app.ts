import express from "express"
import cookieParser from "cookie-parser"
import db from "./db/index"
import { sync as dbSync } from "./db/sync"
import { relation as dbrelation } from "./db/relation"
import redisClient from "./db/redis"

import AuthCheck from "./middlewares/auth-check"

import authRoute from "./routes/auth"
import noteRoute from "./routes/note"

import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(express.json())

app.use(cookieParser())

app.use(async (req, res, next) => {
  ;(req as unknown as Request & { db: any }).db = db
  ;(req as unknown as Request & { redis: any }).redis = await redisClient()
  next()
})

app.use("/api/auth", authRoute)

app.use("/api/note", AuthCheck, noteRoute)

console.log("Completed mounting API routes.")
app.set("port", process.env.PORT || 5001)
const server = app.listen(process.env.PORT || 5001, async () => {
  try {
    await db.authenticate() //do authentication
    console.log("Connection has been established successfully.")
  } catch (error: any) {
    console.error("Unable to connect to the database:", error)
    throw new Error(error)
  }
  await dbrelation()
  await dbSync()

  console.log("Server started")
  console.log(`> Ready on http://localhost:${process.env.PORT || 5001}`)
})

process.on("SIGINT", () => {
  console.log("SIGINT received.")
  console.log("Shutting down server instance.")

  server.close(async (err: any) => {
    if (err) return console.error(err)

    console.log("Shutting down database connection.")
    await db.close()
    await (await redisClient()).disconnect()
    try {
      // @TODO: Destroy DB
      console.log("All connections terminated.")
      process.exit(0)
    } catch (e) {
      console.error(err)
      process.exit(1)
    }
  })
})
