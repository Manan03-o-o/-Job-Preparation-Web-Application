import api from "../../../api/axios";

// 🔐 REGISTER
export const register = async ({ username, email, password }) => {
  const response = await api.post("/api/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
};

// 🔐 LOGIN
export const login = async ({ email, password }) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  // 🔥 SAVE TOKEN
  localStorage.setItem("token", response.data.token);

  return response.data;
};

// 🔓 LOGOUT
export const logout = async () => {
  localStorage.removeItem("token");
  return { message: "Logged out" };
};

// 👤 GET CURRENT USER
export const getMe = async () => {
  const response = await api.get("/api/auth/get-me");
  return response.data;
};