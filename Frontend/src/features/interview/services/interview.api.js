import api from "../../../api/axios";

/**
 * 🚀 Generate Interview Report
 */
export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  try {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview", formData);

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
      { responseType: "blob" }
    );

    return response.data;
  } catch (error) {
    console.error("generateResumePdf error:", error.message);
    return null;
  }
};