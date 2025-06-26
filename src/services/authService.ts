import { OtpVerificationRequest } from "../types";
import api from "./api";

export const authService = {
  registerSeller: async (data: {
    name: string;
    phoneNumber: string;
    email: string;
    sellerType: "individual" | "company" | "association";
  }) => {
    console.log("Registering seller with data:", data);
    const response = await api.post("/auth/register/seller", data);
    return response.data;
  },

  registerTransporter: async (data: {
    name: string;
    phoneNumber: string;
    email: string;
    businessName: string;
  }) => {
    console.log("Registering transporter with data:", data);
    const response = await api.post("/auth/register/transporter", data);
    return response.data;
  },

  loginWithPhone: async (phoneNumber: string) => {
    const response = await api.post("/auth/login/phone", { phoneNumber });
    return response.data;
  },

  verifyOtp: async (data: OtpVerificationRequest) => {
    const response = await api.post("/auth/verify-otp", data);

    // Store token if exists
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  },

  getProfile: async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Attach token
      },
    });

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },
};

export default authService;
