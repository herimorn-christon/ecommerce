import api from './api';
import { PaymentCallback } from '../types';

const paymentService = {
initiatePayment: async (amount: number | string, phone: string): Promise<any> => {
  try {
    console.log("Raw input ->", { amount, phone });

    // Convert string to number if needed
    let numericAmount = typeof amount === 'string'
      ? Number(amount.replace(/,/g, '').trim())
      : amount;

    console.log("Converted numeric amount:", numericAmount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Invalid amount:", numericAmount);
      throw new Error("Amount must be a valid positive number.");
    }

    const formattedAmount = parseFloat(numericAmount.toFixed(2));

    const payload = {
      amount: formattedAmount,
      phone
    };

    console.log("Final payload being sent to backend:", payload);

    const response = await api.post('/azampay/checkout', payload);

    console.log("Payment initiated successfully. Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Payment error caught:", error);
    console.error("Error response data:", error.response?.data);
    throw new Error(
      error.response?.data?.message?.[0] ||
      error.response?.data?.message ||
      'Failed to initiate payment'
    );
  }
},

  checkPaymentStatus: async (reference: string) => {
    const response = await api.get(`/azampay/status/${reference}`);
    return response.data;
  },

  handlePaymentCallback: async (callbackData: PaymentCallback) => {
    const response = await api.post('/azampay/callback', callbackData);
    return response.data;
  }
};

export default paymentService;