import axios from "axios";

// 🔥 Production backend URL
const API = axios.create({
  baseURL: "https://prepify-backend-edvt.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 ADD THIS (MOST IMPORTANT)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Global error handling
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

// 🔐 LOGIN (🔥 STORE TOKEN HERE)
export const login = async ({ email, password }) => {
  const response = await API.post("/api/auth/login", {
    email,
    password,
  });

  // 🔥 SAVE TOKEN
  localStorage.setItem("token", response.data.token);

  return response.data;
};

// 🔓 LOGOUT
export const logout = async () => {
  localStorage.removeItem("token"); // 🔥 remove token
  return { message: "Logged out" };
};

// 👤 GET CURRENT USER
export const getMe = async () => {
  const response = await API.get("/api/auth/get-me");
  return response.data;
};