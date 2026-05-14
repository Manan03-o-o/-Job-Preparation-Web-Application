require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const { initializeVectorStore } = require("./ai/vectorStore")

connectToDB()

// ── Initialize RAG Vector Store on startup ───────────────────
// Loads interview dataset, generates embeddings, builds in-memory index.
// The server starts immediately — RAG initializes in the background.
initializeVectorStore()
    .then(() => console.log("🧠 RAG Vector Store ready"))
    .catch(err => console.error("⚠️ RAG init warning (server still runs):", err?.message))


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})