/**
 * ─────────────────────────────────────────────────────────────
 * IN-MEMORY VECTOR STORE — Cosine Similarity Semantic Search
 * ─────────────────────────────────────────────────────────────
 * Stores text chunks with their embeddings in memory.
 * Supports semantic search via cosine similarity scoring.
 * No external vector DB needed — everything runs in-process.
 * ─────────────────────────────────────────────────────────────
 */

const fs = require("fs");
const path = require("path");
const { generateEmbedding } = require("./embeddings");

// ── In-memory vector storage ─────────────────────────────────
// Each entry: { id, text, topic, embedding: number[] }
const vectorStore = [];

// ── Track initialization state ───────────────────────────────
let isInitialized = false;

// ─────────────────────────────────────────────────────────────
// COSINE SIMILARITY
// ─────────────────────────────────────────────────────────────

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical direction).
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must have the same dimension");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);

    if (denominator === 0) return 0;

    return dotProduct / denominator;
}

// ─────────────────────────────────────────────────────────────
// CHUNKING — Parse interviewData.txt into Q&A chunks
// ─────────────────────────────────────────────────────────────

/**
 * Parse the interview dataset file into structured chunks.
 * Each chunk contains a topic, question, and answer.
 * @param {string} filePath - Path to interviewData.txt
 * @returns {{ text: string, topic: string }[]}
 */
function parseInterviewData(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const lines = raw.split("\n");
    const chunks = [];

    let currentTopic = "General";
    let currentQuestion = "";
    let currentAnswer = "";

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect topic headers: ### TOPIC: XYZ ###
        if (trimmed.startsWith("### TOPIC:")) {
            const topicMatch = trimmed.match(/### TOPIC:\s*(.+?)\s*###/);
            if (topicMatch) {
                currentTopic = topicMatch[1].trim();
            }
            continue;
        }

        // Detect question line
        if (trimmed.startsWith("Q:")) {
            // Save previous Q&A pair if exists
            if (currentQuestion && currentAnswer) {
                chunks.push({
                    text: `Topic: ${currentTopic}\nQuestion: ${currentQuestion}\nAnswer: ${currentAnswer}`,
                    topic: currentTopic
                });
            }
            currentQuestion = trimmed.substring(2).trim();
            currentAnswer = "";
            continue;
        }

        // Detect answer line
        if (trimmed.startsWith("A:")) {
            currentAnswer = trimmed.substring(2).trim();
            continue;
        }

        // Continuation of answer (multi-line)
        if (currentAnswer && trimmed.length > 0) {
            currentAnswer += " " + trimmed;
        }
    }

    // Don't forget the last Q&A pair
    if (currentQuestion && currentAnswer) {
        chunks.push({
            text: `Topic: ${currentTopic}\nQuestion: ${currentQuestion}\nAnswer: ${currentAnswer}`,
            topic: currentTopic
        });
    }

    return chunks;
}

// ─────────────────────────────────────────────────────────────
// INITIALIZATION — Load dataset and generate embeddings
// ─────────────────────────────────────────────────────────────

/**
 * Initialize the vector store by:
 * 1. Parsing interviewData.txt into chunks
 * 2. Generating embeddings for each chunk
 * 3. Storing them in-memory
 * Call this ONCE during server startup.
 * @returns {Promise<void>}
 */
async function initializeVectorStore() {
    if (isInitialized) {
        console.log("ℹ️  Vector store already initialized");
        return;
    }

    console.log("⏳ Initializing vector store...");

    const dataPath = path.join(__dirname, "interviewData.txt");

    if (!fs.existsSync(dataPath)) {
        throw new Error(`Interview data file not found: ${dataPath}`);
    }

    const chunks = parseInterviewData(dataPath);
    console.log(`📄 Parsed ${chunks.length} Q&A chunks from dataset`);

    // Generate embeddings for all chunks
    let processed = 0;
    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);
        vectorStore.push({
            id: `chunk_${vectorStore.length}`,
            text: chunk.text,
            topic: chunk.topic,
            embedding
        });
        processed++;
        if (processed % 10 === 0) {
            console.log(`   Embedded ${processed}/${chunks.length} chunks...`);
        }
    }

    isInitialized = true;
    console.log(`✅ Vector store initialized with ${vectorStore.length} entries`);
}

// ─────────────────────────────────────────────────────────────
// SEMANTIC SEARCH — Find top-K most relevant chunks
// ─────────────────────────────────────────────────────────────

/**
 * Search the vector store for the most semantically similar chunks.
 * @param {string} query - The user's question/query
 * @param {number} [topK=5] - Number of top results to return
 * @param {number} [threshold=0.3] - Minimum similarity score
 * @returns {Promise<{ text: string, topic: string, score: number }[]>}
 */
async function semanticSearch(query, topK = 5, threshold = 0.3) {
    if (!isInitialized || vectorStore.length === 0) {
        console.warn("⚠️ Vector store not initialized — returning empty results");
        return [];
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
        return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Score all stored vectors against the query
    const scored = vectorStore.map(entry => ({
        text: entry.text,
        topic: entry.topic,
        score: cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    // Sort by similarity (highest first), filter by threshold, take topK
    return scored
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/**
 * Search filtered by a specific topic.
 * @param {string} query - The user's question
 * @param {string} topic - Topic to filter by (e.g., "React.js")
 * @param {number} [topK=3]
 * @returns {Promise<{ text: string, topic: string, score: number }[]>}
 */
async function searchByTopic(query, topic, topK = 3) {
    if (!isInitialized || vectorStore.length === 0) return [];

    const queryEmbedding = await generateEmbedding(query);

    const filtered = vectorStore.filter(
        entry => entry.topic.toLowerCase().includes(topic.toLowerCase())
    );

    const scored = filtered.map(entry => ({
        text: entry.text,
        topic: entry.topic,
        score: cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/**
 * Get total number of entries in the vector store.
 * @returns {number}
 */
function getStoreSize() {
    return vectorStore.length;
}

/**
 * Check if the vector store is ready.
 * @returns {boolean}
 */
function isReady() {
    return isInitialized;
}

module.exports = {
    initializeVectorStore,
    semanticSearch,
    searchByTopic,
    cosineSimilarity,
    getStoreSize,
    isReady
};
