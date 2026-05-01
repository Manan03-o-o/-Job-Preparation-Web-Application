import axios from "axios";

// ✅ Create API instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://prepify-backend-edvt.onrender.com",
});

// 🔥 Attach token to EVERY request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ✅ Centralized error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";

        console.error("[API ERROR]:", message);
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
    try {
        const formData = new FormData();

        formData.append("jobDescription", jobDescription);
        formData.append("selfDescription", selfDescription);
        formData.append("resume", resumeFile);

        // 🔥 Force header (important for FormData requests)
        const token = localStorage.getItem("token");

        const response = await api.post("/api/interview", formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        console.error("generateInterviewReport error:", error.message);
        return null;
    }
};


/**
 * 📄 Get Interview Report by ID
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        if (!interviewId) return null;

        const response = await api.get(`/api/interview/report/${interviewId}`);

        return response.data;

    } catch (error) {
        console.error("getInterviewReportById error:", error.message);
        return null;
    }
};


/**
 * 📚 Get All Interview Reports
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview");

        return response.data;

    } catch (error) {
        console.error("getAllInterviewReports error:", error.message);
        return null;
    }
};


/**
 * 📥 Generate Resume PDF
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        if (!interviewReportId) return null;

        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            {},
            {
                responseType: "blob",
            }
        );

        return response.data;

    } catch (error) {
        console.error("generateResumePdf error:", error.message);
        return null;
    }
};

export default api;