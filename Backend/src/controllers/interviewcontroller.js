const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");


// ─────────────────────────────────────────────
// 1. GENERATE INTERVIEW REPORT
// ─────────────────────────────────────────────

async function generateInterViewReportController(req, res) {
    try {
        // ── Validate uploaded file ─────────────────────────────────
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: "Resume PDF file is required." });
        }

        // ── Parse PDF ─────────────────────────────────────────────
        let resumeText = "";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text?.trim() || "";
        } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr?.message);
            return res.status(400).json({ message: "Could not read the uploaded PDF. Please upload a valid PDF file." });
        }

        console.log("Resume text (first 200 chars):", resumeText.slice(0, 200));

        if (!resumeText || resumeText.length < 20) {
            return res.status(400).json({
                message: "The uploaded PDF has no readable text. Please upload a text-based PDF (not a scanned image)."
            });
        }

        // ── Validate body fields ───────────────────────────────────
        const { selfDescription, jobDescription } = req.body;

        if (!selfDescription || selfDescription.trim().length < 5) {
            return res.status(400).json({ message: "selfDescription is required." });
        }

        if (!jobDescription || jobDescription.trim().length < 10) {
            return res.status(400).json({ message: "jobDescription is required." });
        }

        // ── Call AI service ───────────────────────────────────────
        console.log("Calling AI service for interview report...");
        const aiReport = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            jobDescription: jobDescription.trim()
        });

        console.log("AI Report received — title:", aiReport?.title, "matchScore:", aiReport?.matchScore);

        // ── Build safe report with fallbacks ─────────────────────
        const safeReport = {
            title: aiReport?.title || "Software Developer",
            matchScore: typeof aiReport?.matchScore === "number" ? aiReport.matchScore : 75,

            technicalQuestions: Array.isArray(aiReport?.technicalQuestions) && aiReport.technicalQuestions.length > 0
                ? aiReport.technicalQuestions
                : [
                    { question: "Explain the Node.js event loop.", intention: "Tests async knowledge", answer: "Handles async tasks via event queue and callback execution." },
                    { question: "What is REST API?", intention: "Tests API knowledge", answer: "Stateless API architecture using HTTP methods." },
                    { question: "Difference between SQL and NoSQL?", intention: "Tests DB knowledge", answer: "SQL is relational and structured, NoSQL is flexible and scalable." },
                    { question: "What is JWT and how does it work?", intention: "Tests security knowledge", answer: "JSON Web Token used for stateless authentication." },
                    { question: "Explain closures in JavaScript.", intention: "Tests JS fundamentals", answer: "Functions that retain access to their outer scope." }
                ],

            behavioralQuestions: Array.isArray(aiReport?.behavioralQuestions) && aiReport.behavioralQuestions.length > 0
                ? aiReport.behavioralQuestions
                : [
                    { question: "Tell me about yourself.", intention: "Assess communication", answer: "Structured intro covering background, skills, and goals." },
                    { question: "Describe a challenge you overcame.", intention: "Assess problem solving", answer: "Use STAR format focusing on your specific actions." },
                    { question: "Why do you want this role?", intention: "Assess motivation", answer: "Connect your skills and goals to the company's mission." }
                ],

            skillGaps: Array.isArray(aiReport?.skillGaps) && aiReport.skillGaps.length > 0
                ? aiReport.skillGaps
                : [
                    { skill: "System Design", severity: "high" },
                    { skill: "Cloud Services", severity: "medium" },
                    { skill: "Testing & TDD", severity: "low" }
                ],

            preparationPlan: Array.isArray(aiReport?.preparationPlan) && aiReport.preparationPlan.length > 0
                ? aiReport.preparationPlan
                : [
                    { day: 1, focus: "Core Language Fundamentals", tasks: ["Review key concepts", "Solve 3 coding problems"] },
                    { day: 2, focus: "System Design Basics", tasks: ["Study architecture patterns", "Design a URL shortener"] },
                    { day: 3, focus: "Database Deep Dive", tasks: ["Practice SQL joins", "Review NoSQL concepts"] },
                    { day: 4, focus: "API and Security", tasks: ["Build a REST API", "Implement JWT auth"] },
                    { day: 5, focus: "Behavioral Preparation", tasks: ["Prepare 5 STAR stories", "Practice with a peer"] },
                    { day: 6, focus: "Mock Interview", tasks: ["Full 45-minute mock session", "Review weak areas"] },
                    { day: 7, focus: "Review and Confidence", tasks: ["Revisit top weak areas", "Research the company"] }
                ]
        };

        console.log("Saving report to database...");

        // ── Save to database ──────────────────────────────────────
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            jobDescription: jobDescription.trim(),
            title: safeReport.title,
            matchScore: safeReport.matchScore,
            technicalQuestions: safeReport.technicalQuestions,
            behavioralQuestions: safeReport.behavioralQuestions,
            skillGaps: safeReport.skillGaps,
            preparationPlan: safeReport.preparationPlan
        });

        console.log("✅ Report saved — ID:", interviewReport._id);

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (err) {
        console.error("❌ generateInterViewReportController ERROR:", err?.message);
        console.error("Stack:", err?.stack);
        return res.status(500).json({ message: "Internal server error while generating report." });
    }
}


// ─────────────────────────────────────────────
// 2. GET REPORT BY ID
// ─────────────────────────────────────────────

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ message: "Invalid report ID." });
        }

        const report = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        return res.status(200).json({
            message: "success",
            interviewReport: report
        });

    } catch (err) {
        console.error("❌ getInterviewReportByIdController ERROR:", err?.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}


// ─────────────────────────────────────────────
// 3. GET ALL REPORTS
// ─────────────────────────────────────────────

async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 }) // newest first
            .select("-resume"); // exclude raw resume text from list view

        return res.status(200).json({
            message: "success",
            count: reports.length,
            interviewReports: reports
        });

    } catch (err) {
        console.error("❌ getAllInterviewReportsController ERROR:", err?.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}


// ─────────────────────────────────────────────
// 4. GENERATE RESUME PDF
// ─────────────────────────────────────────────

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        // ── Validate ID format ────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({ message: "Invalid report ID." });
        }

        // ── Find the report ───────────────────────────────────────
        const report = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id  // ensure user owns this report
        });

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        // ── Validate report has required fields ───────────────────
        if (!report.resume || report.resume.trim().length < 10) {
            return res.status(400).json({ message: "This report has no resume content to generate a PDF from." });
        }

        console.log("Generating PDF for report ID:", interviewReportId);

        // ── Call the PDF generation service ───────────────────────
        const pdfBuffer = await generateResumePdf({
            resume: report.resume,
            jobDescription: report.jobDescription || "",
            selfDescription: report.selfDescription || ""
        });

        // ── Validate the returned buffer ───────────────────────────
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("PDF generation returned empty buffer");
        }

        console.log(`✅ PDF ready — ${pdfBuffer.length} bytes — sending to client`);

        // ── Send the PDF ──────────────────────────────────────────
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length,
            "Cache-Control": "no-cache"
        });

        return res.end(pdfBuffer, "binary");

    } catch (err) {
        console.error("❌ generateResumePdfController ERROR:", err?.message);
        console.error("Stack:", err?.stack);

        // Don't send PDF headers if we already set them — check if headers were sent
        if (!res.headersSent) {
            return res.status(500).json({
                message: err?.message || "Failed to generate resume PDF"
            });
        }
    }
}


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};