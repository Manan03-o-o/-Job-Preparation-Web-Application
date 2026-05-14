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
const aiRouter = require("./routes/ai.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/ai", aiRouter)

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Prepify API is running ✅" })
})

// Error handling middleware
const { notFoundHandler, globalErrorHandler } = require("./middlewares/error.middleware")
app.use(notFoundHandler)
app.use(globalErrorHandler)

module.exports = app