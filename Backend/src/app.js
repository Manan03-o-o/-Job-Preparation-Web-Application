const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// ✅ SIMPLE + WORKING CORS
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Prepify API is running ✅" })
})

// 404
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err?.message)
  res.status(500).json({ message: err?.message || "Internal server error" })
})

module.exports = app