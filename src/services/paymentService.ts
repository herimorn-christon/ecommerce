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

interface PesapalCreateOrderRequest {
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  billingAddress: {
    phone_number: string;
    email_address: string;
    country_code: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    line_1: string;
    line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    zip_code: string;
  };
  cancellationUrl: string;
  branch: string;
}

interface PesapalCreateOrderResponse {
  referenceId: string;
  transactionId: string;
  order_tracking_id: string;
  redirect_url: string;
  error: string | null;
  status: string;
}

interface PesapalTransactionStatusResponse {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  order_tracking_id: string;
  payment_status_description: string;
  description: string | null;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  account_number: string | null;
  payment_status_code: string;
  currency: string;
  error: {
    error_type: string | null;
    code: string | null;
    message: string | null;
  };
  status: string;
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

  // Pesapal create order
  createPesapalOrder: async (
    orderData: PesapalCreateOrderRequest
  ): Promise<PesapalCreateOrderResponse> => {
    try {
      const response = await paymentApi.post(
        "/pesapal/create-order",
        orderData
      );

      if (!response.data) {
        throw new Error("No response data received from Pesapal service");
      }

      return response.data;
    } catch (error: any) {
      console.error("Pesapal order creation failed:", error);
      throw error;
    }
  },

  // Check Pesapal transaction status
  checkPesapalTransactionStatus: async (
    trackingId: string
  ): Promise<PesapalTransactionStatusResponse> => {
    try {
      const response = await paymentApi.get(
        `/pesapal/transaction-status/${trackingId}`
      );

      if (!response.data) {
        throw new Error("No response data received from Pesapal service");
      }

      return response.data;
    } catch (error: any) {
      console.error("Pesapal status check failed:", error);
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
      const response = await paymentApi.post("/azampay/callback", callbackData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default paymentService;
