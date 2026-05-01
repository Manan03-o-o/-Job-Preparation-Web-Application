import axios from "axios";

// ✅ Create API instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://prepify-backend-edvt.onrender.com",
});

// 🔥 ADD THIS (MOST IMPORTANT — SEND TOKEN)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ✅ centralised error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";

        console.error("[API Error]", message);
        return Promise.reject(new Error(message));
    }
);


/**
 * 🚀 Generate Interview Report
 */
export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile
}) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    // ❌ removed trailing slash
    const response = await api.post("/api/interview", formData);

    return response?.data;
};


/**
 * 📄 Get Interview Report by ID
 */
export const getInterviewReportById = async (interviewId) => {
    if (!interviewId) return null;

    const response = await api.get(`/api/interview/report/${interviewId}`);

    return response?.data;
};


/**
 * 📚 Get All Interview Reports
 */
export const getAllInterviewReports = async () => {
    // ❌ removed trailing slash
    const response = await api.get("/api/interview");

    return response?.data;
};


/**
 * 📥 Generate Resume PDF
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    if (!interviewReportId) return null;

    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        {},
        {
            responseType: "blob",
        }
    );

    return response?.data;
};