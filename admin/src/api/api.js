import axios from "axios";

// ✅ Définir l'adresse du backend ici 
 //  export const backendUrl = "http://localhost:5000"; 

 export const backendUrl = "https://inventory2-uexd.onrender.com";

export const api = axios.create({
  baseURL: backendUrl, // Utilisation de backendUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token; // 🔹 Utilisé pour correspondre à ton backend
  }
  return config;
});
