/**
 * ─────────────────────────────────────────────────────────────
 * AI CONTROLLER — Handles RAG-powered API endpoints
 * ─────────────────────────────────────────────────────────────
 * POST /api/ai/ask            — Ask interview questions (RAG)
 * POST /api/ai/evaluate       — Evaluate user answers (AI scorecard)
 * POST /api/ai/resume-analysis — Analyze uploaded resume PDF
 * ─────────────────────────────────────────────────────────────
 */

const pdfParse = require("pdf-parse");
const { ragAsk, ragEvaluate, ragResumeAnalysis } = require("../../ai/ragPipeline");
const { isReady, getStoreSize } = require("../../ai/vectorStore");


// ─────────────────────────────────────────────────────────────
// 1. ASK — RAG-powered interview Q&A
// ─────────────────────────────────────────────────────────────

async function askController(req, res) {
    try {
        const { question, topic } = req.body;

        if (!question || typeof question !== "string" || question.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid question (at least 3 characters)"
            });
        }

        console.log(`[AI/ASK] Question: "${question.substring(0, 80)}..." | Topic: ${topic || "auto-detect"}`);

        const result = await ragAsk(question.trim(), topic || null);

        return res.status(200).json({
            success: true,
            message: "Answer generated successfully using RAG pipeline",
            data: result
        });

    } catch (err) {
        console.error("❌ askController ERROR:", err?.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate answer. Please try again.",
            error: process.env.NODE_ENV === "development" ? err?.message : undefined
        });
    }
}


// ─────────────────────────────────────────────────────────────
// 2. EVALUATE — AI-powered answer evaluation scorecard
// ─────────────────────────────────────────────────────────────

async function evaluateController(req, res) {
    try {
        const { question, userAnswer } = req.body;

        if (!question || typeof question !== "string" || question.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid interview question"
            });
        }

        if (!userAnswer || typeof userAnswer !== "string" || userAnswer.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Please provide your answer (at least 5 characters)"
            });
        }

        console.log(`[AI/EVALUATE] Question: "${question.substring(0, 60)}..." | Answer length: ${userAnswer.length}`);

        const result = await ragEvaluate(question.trim(), userAnswer.trim());

        return res.status(200).json({
            success: true,
            message: "Answer evaluated successfully",
            data: result
        });

    } catch (err) {
        console.error("❌ evaluateController ERROR:", err?.message);
        return res.status(500).json({
            success: false,
            message: "Failed to evaluate answer. Please try again.",
            error: process.env.NODE_ENV === "development" ? err?.message : undefined
        });
    }
}


// ─────────────────────────────────────────────────────────────
// 3. RESUME ANALYSIS — Upload PDF, extract text, analyze
// ─────────────────────────────────────────────────────────────

async function resumeAnalysisController(req, res) {
    try {
        // Validate uploaded file
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume PDF file"
            });
        }

        // Parse PDF to text
        let resumeText = "";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text?.trim() || "";
        } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr?.message);
            return res.status(400).json({
                success: false,
                message: "Could not read the uploaded PDF. Please upload a valid text-based PDF."
            });
        }

        if (!resumeText || resumeText.length < 20) {
            return res.status(400).json({
                success: false,
                message: "The uploaded PDF has no readable text. Please upload a text-based PDF (not a scanned image)."
            });
        }

        console.log(`[AI/RESUME] Extracted ${resumeText.length} chars from resume PDF`);

        const result = await ragResumeAnalysis(resumeText);

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully using RAG pipeline",
            data: result
        });

    } catch (err) {
        console.error("❌ resumeAnalysisController ERROR:", err?.message);
        return res.status(500).json({
            success: false,
            message: "Failed to analyze resume. Please try again.",
            error: process.env.NODE_ENV === "development" ? err?.message : undefined
        });
    }
}


// ─────────────────────────────────────────────────────────────
// 4. HEALTH CHECK — RAG system status
// ─────────────────────────────────────────────────────────────

function ragHealthController(req, res) {
    return res.status(200).json({
        success: true,
        message: "RAG system status",
        data: {
            vectorStoreReady: isReady(),
            totalChunks: getStoreSize(),
            model: "llama-3.3-70b-versatile",
            embeddingModel: "all-MiniLM-L6-v2"
        }
    });
}


module.exports = {
    askController,
    evaluateController,
    resumeAnalysisController,
    ragHealthController
};
