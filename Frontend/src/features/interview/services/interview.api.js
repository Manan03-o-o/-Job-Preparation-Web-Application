import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL , // ✅ use env variable with fallback
    withCredentials: true,
})

// ✅ centralised error handling — all failed requests are caught here
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || "An unexpected error occurred"
        console.error("[API Error]", message)
        return Promise.reject(new Error(message))
    }
)


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    // ✅ removed manual "Content-Type" header — Axios sets it automatically for FormData
    //    including the correct multipart boundary, which a manual header would break
    const response = await api.post("/api/interview/", formData)

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, {}, { // ✅ {} instead of null for empty body
        responseType: "blob"
    })

    return response.data
}