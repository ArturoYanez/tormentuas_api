
import axios from "axios";

// Cambia aquí la baseURL por la de tu API real, usamos JSONPlaceholder como ejemplo
const baseURL = import.meta.env.VITE_API_URL || "https://jsonplaceholder.typicode.com/";

const api = axios.create({
  baseURL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Puedes configurar interceptores para agregar tokens de auth, logs, etc:
api.interceptors.request.use(
  (config) => {
    // Ejemplo: agregar token
    // const token = localStorage.getItem('authToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Puedes centralizar manejo de errores aquí
    return Promise.reject(error);
  }
);

export default api;
