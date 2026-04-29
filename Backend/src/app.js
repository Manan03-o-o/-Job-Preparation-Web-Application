const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// ✅ CORS — fixed for production cross-domain cookie support
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "https://job-preparation-web-application-nck.vercel.app"
        ]
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Routes ────────────────────────────────────────────────────
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({ message: "Prepify API is running ✅" })
})

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    })
})

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Global error:", err?.message)
    res.status(500).json({ message: err?.message || "Internal server error" })
})

module.exports = app