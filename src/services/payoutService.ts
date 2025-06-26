import {
  SellerEarningsSummary,
  SellerPayout,
  SellerPayoutRequest,
} from "../types";
import api from "./api";

const payoutService = {
  // Request a new payout
  requestPayout: async (
    payoutRequest: SellerPayoutRequest
  ): Promise<{ message: string; payout: SellerPayout }> => {
    try {
      const response = await api.post("/seller-payouts", payoutRequest);
      return response.data;
    } catch (error: any) {
      console.error("Failed to request payout:", error);
      throw new Error(
        error.response?.data?.message || "Failed to request payout"
      );
    }
  },

  // Get seller's payouts history
  getSellerPayouts: async (): Promise<SellerPayout[]> => {
    try {
      const response = await api.get("/seller-payouts/me");
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch payouts:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch payouts"
      );
    }
  },

  // Get single payout details
  getPayoutById: async (
    id: string
  ): Promise<{ message: string; payout: SellerPayout }> => {
    try {
      const response = await api.get(`/seller-payouts/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch payout details:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout details"
      );
    }
  },

  // Cancel a pending payout
  cancelPayout: async (
    id: string
  ): Promise<{ message: string; payout: SellerPayout }> => {
    try {
      const response = await api.patch(`/seller-payouts/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to cancel payout:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel payout"
      );
    }
  },

  // Get seller earnings summary
  getEarningsSummary: async (): Promise<SellerEarningsSummary> => {
    try {
      const response = await api.get("/seller-earnings/me/summary");
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch earnings summary:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch earnings summary"
      );
    }
  },
};

export default payoutService;
