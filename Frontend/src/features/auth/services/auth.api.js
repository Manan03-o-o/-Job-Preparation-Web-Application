import axios from "axios";

// 🔥 Production backend URL (no env confusion)
const API = axios.create({
  baseURL: "https://prepify-backend-edvt.onrender.com",
  withCredentials: true, // required for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Global error handling (optional but useful)
API.interceptors.response.use(
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

// 🔐 REGISTER
export const register = async ({ username, email, password }) => {
  const response = await API.post("/api/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

// 🔐 LOGIN
export const login = async ({ email, password }) => {
  const response = await API.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

// 🔓 LOGOUT
export const logout = async () => {
  const response = await API.get("/api/auth/logout");
  return response.data;
};

// 👤 GET CURRENT USER
export const getMe = async () => {
  const response = await API.get("/api/auth/get-me");
  return response.data;
};