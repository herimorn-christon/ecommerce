import paymentApi from './paymentApi';
import { PaymentCallback } from '../types';

interface PaymentResponse {
  referenceId: string;
  message: string;
  success: boolean;
}

const paymentService = {
  initiatePayment: async (amount: number | string, phone: string): Promise<PaymentResponse> => {
    try {
      // Debug log the incoming amount
      console.log('Raw amount received:', amount, typeof amount);

      // Convert amount to number first
      let numericAmount: number;
      if (typeof amount === 'string') {
        // Remove any non-numeric characters and convert
        const cleanAmount = amount.replace(/[^0-9]/g, '');
        console.log('Cleaned amount string:', cleanAmount);
        numericAmount = parseInt(cleanAmount, 10);
      } else {
        numericAmount = amount;
      }

      // Debug log the converted amount
      console.log('Converted amount:', numericAmount, typeof numericAmount);

      // Validate amount after conversion
      if (isNaN(numericAmount) || numericAmount <= 0) {
        console.error('Amount validation failed:', {
          original: amount,
          cleaned: numericAmount,
          type: typeof numericAmount
        });
        throw new Error("Amount must be a valid positive number");
      }

      const finalAmount = Math.round(numericAmount);
      console.log('Final amount to be sent:', finalAmount);

      // Format phone number
      let formattedPhone = phone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('255')) {
        formattedPhone = `255${formattedPhone.replace(/^0+/, '')}`;
      }

      const payload = {
        amount: finalAmount,
        phone: formattedPhone
      };

      console.log('Making payment request with payload:', payload);

      // Using the correct endpoint
      const response = await paymentApi.post('/azampay/checkout', payload);
      
      if (!response.data) {
        throw new Error('No response data received from payment service');
      }

      return {
        referenceId: response.data.referenceId,
        transactionId: response.data.transactionId || '', // Ensure transactionId is included 
        message: response.data.message,
        success: response.data.success,
      };

    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  },

  // Update status check endpoint
  checkPaymentStatus: async (referenceId: string): Promise<PaymentResponse> => {
    try {
      const response = await paymentApi.get(`/azampay/payment/status/${referenceId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Update callback endpoint
  handlePaymentCallback: async (callbackData: PaymentCallback): Promise<any> => {
    try {
      const response = await paymentApi.post('/azampay/payment/callback', callbackData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default paymentService;