/**
 * ─────────────────────────────────────────────────────────────
 * EMBEDDINGS ENGINE — Transformer-based Text Embedding Generator
 * ─────────────────────────────────────────────────────────────
 * Uses @xenova/transformers (all-MiniLM-L6-v2) to generate
 * 384-dimensional vector embeddings from text.
 * Singleton pattern ensures the model is loaded only once.
 * ─────────────────────────────────────────────────────────────
 */

const { pipeline } = require("@xenova/transformers");

// ── Singleton: cache the embedding pipeline ──────────────────
let embeddingPipeline = null;

/**
 * Load (or reuse) the embedding model.
 * First call downloads ~23 MB model; subsequent calls are instant.
 * @returns {Promise<Function>} - The embedding pipeline function
 */
async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        console.log("⏳ Loading embedding model (all-MiniLM-L6-v2)...");
        embeddingPipeline = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
        console.log("✅ Embedding model loaded successfully");
    }
    return embeddingPipeline;
}

/**
 * Generate a 384-dimensional embedding vector for a single text string.
 * @param {string} text - The input text to embed
 * @returns {Promise<number[]>} - Normalized embedding vector
 */
async function generateEmbedding(text) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new Error("Input text for embedding must be a non-empty string");
    }

    const pipe = await getEmbeddingPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });

    // Convert from Tensor to plain JS array
    return Array.from(output.data);
}

/**
 * Generate embeddings for an array of text strings (batch processing).
 * Processes sequentially to avoid memory spikes.
 * @param {string[]} texts - Array of input strings
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error("Input must be a non-empty array of strings");
    }

    const embeddings = [];
    for (const text of texts) {
        const embedding = await generateEmbedding(text);
        embeddings.push(embedding);
    }

    return embeddings;
}

module.exports = {
    generateEmbedding,
    generateEmbeddings,
    getEmbeddingPipeline
};
