import { PaymentCallback } from "../types";
import paymentApi from "./paymentApi";

interface PaymentInitiateResponse {
  referenceId: string;
  transactionId: string;
  message: string;
  success: boolean;
  transaction?: {
    id: string;
    phone: string;
    operator: string;
    provider: string;
    status: string;
    reference: string;
    thirdPartyId?: string;
    amount: string;
  };
}

interface PaymentStatusResponse {
  reference: string;
  message: string;
  success: boolean;
  transactionId: string;
  transaction?: {
    id: string;
    status: string;
    reference: string;
    amount: string;
  };
}

const paymentService = {
  initiatePayment: async (
    amount: number | string,
    phone: string
  ): Promise<PaymentInitiateResponse> => {
    try {
      // Format amount to a number
      let numericAmount: number;
      if (typeof amount === "string") {
        const cleanAmount = amount.replace(/[^0-9]/g, "");
        console.log("Cleaned amount string:", cleanAmount);
        numericAmount = parseInt(cleanAmount, 10);
      } else {
        numericAmount = amount;
      }

      if (isNaN(numericAmount) || numericAmount <= 0) {
        console.error("Amount validation failed:", {
          original: amount,
          cleaned: numericAmount,
          type: typeof numericAmount,
        });
        throw new Error("Amount must be a valid positive number");
      }

      const finalAmount = Math.round(numericAmount);
      console.log("Final amount to be sent:", finalAmount);

      // Format phone number to ensure it starts with 255
      let formattedPhone = phone.replace(/\s+/g, "");
      if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith("255")) {
        formattedPhone = `255${formattedPhone.replace(/^0+/, "")}`;
      }

      // Create the payload according to the requirements
      const payload = {
        amount: finalAmount,
        phone: formattedPhone,
      };

      console.log("Making payment request with payload:", payload);

      // Send POST request to the specified endpoint
      const response = await paymentApi.post("/azampay/checkout", payload);

      if (!response.data) {
        throw new Error("No response data received from payment service");
      }

      // Return the response data in the expected format
      return {
        referenceId: response.data.referenceId,
        transactionId: response.data.transactionId,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      throw error;
    }
  },

  checkPaymentStatus: async (
    referenceId: string
  ): Promise<PaymentStatusResponse> => {
    try {
      const response = await paymentApi.get(`/azampay/status/${referenceId}`);
      return {
        reference: response.data.reference,
        message: response.data.message,
        success: response.data.success,
        transactionId: response.data.transactionId,
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Update callback endpoint
  handlePaymentCallback: async (
    callbackData: PaymentCallback
  ): Promise<any> => {
    try {
      const response = await paymentApi.post(
        "/v1/azampay/callback",
        callbackData
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default paymentService;
