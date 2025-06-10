import paymentApi from './paymentApi';

const azampayService = {
  /**
   * Initiates a payment through AzamPay
   * @param amount The amount to pay in TZS
   * @param phoneNumber The customer's phone number in format 255XXXXXXXXX
   * @param orderId Optional order ID to associate with this payment
   */
  async initiatePayment(
    amount: number | string,
    phoneNumber: string,
    orderId?: string
  ) {
    try {
      // Step 1: Log the raw input
      console.log("Raw input ->", { amount, phoneNumber, orderId });
      
      // Using the correct endpoint
      const response = await paymentApi.post('/azampay/checkout', {
        amount,
        phoneNumber,
        orderId
      });

      return response.data;
    } catch (error: any) {
      // Step 2: Log full error details
      console.error('Payment initiation error:', error);
      throw error;
    }
  }
};

export default azampayService;