const pdfParse = require("pdf-parse/lib/pdf-parse.js")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * Generate Interview Report
 */
async function generateInterViewReportController(req, res) {
    try {
        // ✅ Check file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required"
            })
        }

        console.log("FILE RECEIVED:", req.file)

        // ✅ Validate inputs early
        const { selfDescription, jobDescription } = req.body

        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
                message: "selfDescription and jobDescription are required"
            })
        }

        // ✅ Parse PDF
        let resumeContent = ""
        try {
            const pdfData = await pdfParse(req.file.buffer)
            resumeContent = pdfData.text
            console.log("RESUME CONTENT PREVIEW:", resumeContent.slice(0, 200))
        } catch (pdfErr) {
            console.error("PDF PARSE ERROR:", pdfErr)
            return res.status(400).json({
                message: "Failed to parse PDF. Please upload a valid PDF file.",
                error: pdfErr.message
            })
        }

        // ✅ Check if resume content is empty
        if (!resumeContent || resumeContent.trim() === "") {
            return res.status(400).json({
                message: "Could not extract text from PDF. Please upload a valid resume PDF."
            })
        }

        // ✅ Call AI
        const aiResponse = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        console.log("AI RESPONSE:", aiResponse)

        // ✅ Save to DB
        const interviewReport = await interviewReportModel.create({
            user: req.user?.id || null,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            title: aiResponse?.title || "Software Developer",
            ...aiResponse
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (err) {
        console.error("ERROR:", err)

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

/**
 * Get Interview Report By ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        // ✅ Validate interviewId
        if (!interviewId) {
            return res.status(400).json({
                message: "Interview ID is required"
            })
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user?.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })

    } catch (err) {
        console.error("ERROR:", err)

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

/**
 * Get All Interview Reports
 */
async function getAllInterviewReportsController(req, res) {
    try {
        // ✅ Check user
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized. Please login."
            })
        }

        const interviewReports = await interviewReportModel
            .find({ user: req.user?.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            )

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })

    } catch (err) {
        console.error("ERROR:", err)

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

/**
 * Generate Resume PDF
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // ✅ Validate interviewReportId
        if (!interviewReportId) {
            return res.status(400).json({
                message: "Interview Report ID is required"
            })
        }

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        // ✅ Validate required fields
        if (!resume || !jobDescription || !selfDescription) {
            return res.status(400).json({
                message: "Interview report is missing required fields to generate PDF."
            })
        }

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        // ✅ Validate pdfBuffer
        if (!pdfBuffer) {
            return res.status(500).json({
                message: "Failed to generate PDF. Please try again."
            })
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.send(pdfBuffer)

    } catch (err) {
        console.error("ERROR:", err)

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}