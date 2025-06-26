import { Order, PaymentCallback } from "../types";
import api from "./api";

const orderService = {
  createOrder: async (orderData: {
    items: { productId: string; quantity: number }[];
    deliveryOption: string;
    paymentMethod: string;
    paymentDetails: {
      provider: string;
      phoneNumber: string;
      transactionId: string;
    };
    addressId: string;
    notes?: string;
    transactionId: string; // Add at root level
  }) => {
    try {
      // Validate transaction ID
      const { paymentMethod, transactionId } = orderData;
      console.log("the received order transactionId:", transactionId);

      if (paymentMethod === "mobile_money") {
        if (!transactionId || typeof transactionId !== "string") {
          throw new Error("transactionId must be a string");
        }

        if (!transactionId.trim()) {
          throw new Error("transactionId cannot be empty");
        }
      }

      // Log the validated data
      console.log("Sending order with validated data:", {
        ...orderData,
        transactionId,
      });

      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error: any) {
      console.error("Order Creation Failed:", {
        error,
        data: orderData,
      });
      throw error;
    }
  },
  getOrders: async () => {
    try {
      const response = await api.get("/orders");
      console.log("Orders API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);
      console.log("Order details API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch order:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },

  cancelOrder: async ({
    orderId,
    status,
  }: {
    orderId: string;
    status: string;
  }) => {
    try {
      // Log request for debugging
      console.log("Cancelling order:", { orderId, status });

      // Use POST instead of PATCH
      const response = await api.post(`/orders/${orderId}/cancel`, {
        status: "cancelled",
      });

      console.log("Cancel order response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Cancel order failed:", {
        error: error.response?.data,
        orderId,
        status,
      });
      throw new Error(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  },

  createAddress: async (addressData: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    district: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
  }) => {
    try {
      const response = await api.post("/addresses", addressData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create address"
      );
    }
  },

  getAddresses: async () => {
    try {
      const response = await api.get("/addresses");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch addresses"
      );
    }
  },

  // Payment processing
  initiatePayment: async (
    amount: number | string,
    phone: string
  ): Promise<any> => {
    try {
      // Log raw inputs for debugging
      console.log("Raw input ->", { amount, phone });

      // Convert to number and ensure it's in whole TZS (no decimals)
      let finalAmount: number;
      if (typeof amount === "string") {
        // Remove any commas and convert to number
        finalAmount = Math.round(Number(amount.replace(/[^0-9.-]+/g, "")));
      } else {
        finalAmount = Math.round(amount);
      }

      // Additional validation
      if (isNaN(finalAmount) || finalAmount <= 0) {
        throw new Error("Invalid amount provided");
      }

      // Format phone number (remove + prefix if exists)
      const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone;

      // Create payload with exact amount
      const payload = {
        amount: finalAmount, // This must match exactly with order total
        phone: formattedPhone,
      };

      console.log("Payment payload:", payload);

      // Make the request
      const response = await api.post("/azampay/checkout", payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Payment initiation failed");
      }

      console.log("Payment Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      throw new Error(
        error.response?.data?.message || "Failed to initiate payment"
      );
    }
  },

  checkPaymentStatus: async (reference: string) => {
    const response = await api.get(`/azampay/status/${reference}`);
    return response.data;
  },

  handlePaymentCallback: async (callbackData: PaymentCallback) => {
    const response = await api.post("/azampay/callback", callbackData);
    return response.data;
  },

  getSellerOrders: async (): Promise<{ orders: Order[]; count: number }> => {
    try {
      const response = await api.get("/orders/seller");
      console.log("Seller orders API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch seller orders:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch seller orders"
      );
    }
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<Order> => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  },
};

export default orderService;
