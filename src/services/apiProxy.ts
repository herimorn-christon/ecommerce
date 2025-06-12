import axios from "axios";

// Create a proxy API instance for Tanfish Market
const TANFISH_API_URL =
  import.meta.env.VITE_API_BASE_URL || "https://fishmarket.juafaida.com";

const apiProxy = axios.create({
  baseURL: TANFISH_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Origin, Content-Type, Accept, Authorization",
  },
  withCredentials: true,
});

// Add a request interceptor to add auth token to requests
apiProxy.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
apiProxy.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiProxy;
