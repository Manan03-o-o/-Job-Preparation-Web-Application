import axios from "axios";

// Create API instance with base URL from env
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ Required to send cookies (JWT token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach token to requests (if stored in localStorage for backup)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Optional backup if cookies fail
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Register function
export const register = async (userData) => {
  const response = await API.post("/api/auth/register", userData);
  return response.data;
};

// ✅ Login function
export const login = async (userData) => {
  const response = await API.post("/api/auth/login", userData);
  return response.data;
};

// ✅ Logout function
export const logout = async () => {
  const response = await API.get("/api/auth/logout");
  return response.data;
};

// ✅ Fix getMe function to call correct endpoint
export const getMe = async () => {
  try {
    const response = await API.get("/api/auth/get-me"); // ✅ Matches backend route
    return response.data;
  } catch (err) {
    console.error("getMe API error:", err?.response?.data || err.message);
    throw err; // Re-throw to let useAuth handle it
  }
};