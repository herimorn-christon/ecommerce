import axios from "axios";

const PAYMENT_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/v1`;

const paymentApi = axios.create({
  baseURL: PAYMENT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor with enhanced logging
paymentApi.interceptors.request.use(
  (config) => {
    try {
      // Log complete request details
      console.group("Payment API Request");
      console.log("Full URL:", `${PAYMENT_API_BASE_URL}${config.url}`);
      console.log("Environment:", import.meta.env.MODE);
      console.log("Headers:", config.headers);
      console.log("Method:", config.method?.toUpperCase());
      console.log("Payload:", config.data);
      console.groupEnd();

      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor with try-catch
paymentApi.interceptors.response.use(
  (response) => {
    console.group("Payment API Response");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    try {
      console.group("Payment API Error");
      if (error.response) {
        console.error("Response Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: error.config,
        });
      } else if (error.request) {
        console.error("Request Error (No Response):", error.request);
      } else {
        console.error("Error:", error.message);
      }
      console.groupEnd();
      return Promise.reject(error);
    } catch (e) {
      console.error("Error in error handling:", e);
      return Promise.reject(error);
    }
  }
);

export default paymentApi;
