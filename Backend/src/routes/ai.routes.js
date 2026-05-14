/**
 * ─────────────────────────────────────────────────────────────
 * AI ROUTES — RAG-Powered Interview AI Endpoints
 * ─────────────────────────────────────────────────────────────
 * POST /api/ai/ask              — Ask interview questions (RAG)
 * POST /api/ai/evaluate         — Evaluate user answers
 * POST /api/ai/resume-analysis  — Analyze uploaded resume PDF
 * GET  /api/ai/health           — RAG system health check
 * ─────────────────────────────────────────────────────────────
 */

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const aiController = require("../controllers/ai.controller");

const aiRouter = express.Router();


/**
 * @route POST /api/ai/ask
 * @description Ask an interview question — AI answers using RAG retrieval
 * @access Private (requires JWT)
 * @body { question: string, topic?: string }
 */
aiRouter.post("/ask", authMiddleware.authUser, aiController.askController);


/**
 * @route POST /api/ai/evaluate
 * @description Evaluate user's answer to an interview question
 * @access Private (requires JWT)
 * @body { question: string, userAnswer: string }
 */
aiRouter.post("/evaluate", authMiddleware.authUser, aiController.evaluateController);


/**
 * @route POST /api/ai/resume-analysis
 * @description Upload resume PDF for AI-powered analysis
 * @access Private (requires JWT)
 * @body FormData with "resume" file field
 */
aiRouter.post("/resume-analysis", authMiddleware.authUser, upload.single("resume"), aiController.resumeAnalysisController);


/**
 * @route GET /api/ai/health
 * @description Check RAG system status (vector store, models)
 * @access Public
 */
aiRouter.get("/health", aiController.ragHealthController);


module.exports = aiRouter;
