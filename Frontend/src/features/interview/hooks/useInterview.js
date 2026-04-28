import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport  // ✅ moved inside try so it only returns on success
        } catch (error) {
            console.log(error)
            return null  // ✅ explicit null return on failure instead of crashing
        } finally {
            setLoading(false)
        }
    }

    // ✅ wrapped in useCallback to stabilize reference across renders
    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport  // ✅ moved inside try
        } catch (error) {
            console.log(error)
            return null  // ✅ explicit null return on failure
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    // ✅ wrapped in useCallback to stabilize reference across renders
    const getReports = useCallback(async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports  // ✅ moved inside try
        } catch (error) {
            console.log(error)
            return null  // ✅ explicit null return on failure
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()           // ✅ clean up the appended link element after clicking
            window.URL.revokeObjectURL(url)  // ✅ release the object URL to free memory
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // ✅ getReportById and getReports are now stable refs, safe to include in deps
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}