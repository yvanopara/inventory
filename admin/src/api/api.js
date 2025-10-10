import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // change si besoin
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token; // 🔹 On utilise "token" pour correspondre à ton backend
  }
  return config;
});
