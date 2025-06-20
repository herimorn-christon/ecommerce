import { ArrowLeft } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentForm from "../components/payment/PaymentForm";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearCart } from "../redux/slices/cartSlice";
import { createOrder } from "../redux/slices/ordersSlice";
import { webSocketService } from "../services/webSocketService";

interface PaymentPageLocationState {
  amount: number;
  phone: string;
  addressId: string;
  deliveryOption: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items } = useAppSelector((state) => state.cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Get payment data from location state
  const paymentData = location.state as PaymentPageLocationState;

  // Verify we have the necessary data
  useEffect(() => {
    if (!paymentData.amount || !paymentData.addressId) {
      // Missing required data, redirect back to checkout
      toast.error("Missing payment information. Redirecting back to checkout.");
      navigate("/checkout");
    }
  }, [paymentData, navigate]);

  // Handle payment completion
  const handlePaymentComplete = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Get checkout data from localStorage
      const checkoutDataString = localStorage.getItem("checkoutData");
      if (!checkoutDataString) {
        throw new Error("Checkout data not found");
      }

      const checkoutData = JSON.parse(checkoutDataString);

      // Get transaction ID from payment state
      const transactionId = localStorage.getItem("transactionId");
      if (!transactionId) {
        throw new Error("Transaction ID not found");
      }

      // Create order with the saved checkout data and transaction ID
      const orderData = {
        ...checkoutData,
        paymentDetails: {
          provider: "M-Pesa",
          phoneNumber: paymentData?.phone || "",
          transactionId: transactionId,
        },
        transactionId: transactionId,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      if (!result?.id) {
        throw new Error("Order creation failed: no ID returned");
      }

      // Clear checkout data from localStorage
      localStorage.removeItem("checkoutData");
      localStorage.removeItem("transactionId");

      // Clear cart
      dispatch(clearCart());

      // Set success state and order ID
      setOrderId(result.id);
      setPaymentSuccess(true);
      setPaymentComplete(true);

      // Show success message
      toast.success("Payment successful! Order has been created.");

      // Navigate to order page after a short delay
      setTimeout(() => {
        navigate(`/orders/${result.id}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create your order");
      setPaymentSuccess(false);
      setPaymentComplete(true);
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, navigate, paymentData]);

  // Handle payment failure
  const handlePaymentFailed = useCallback(() => {
    setPaymentSuccess(false);
    setPaymentComplete(true);
    toast.error("Payment failed. Please try again.");
  }, []);

  // Listen for payment callback from socket
  useEffect(() => {
    const handlePaymentCallback = (data: any) => {
      console.log("Payment callback received:", data);

      if (data.status === "success" && data.transactionId) {
        // Store transaction ID for order creation
        localStorage.setItem("transactionId", data.transactionId);
        handlePaymentComplete();
      } else {
        handlePaymentFailed();
      }
    };

    // Ensure socket is connected
    if (!webSocketService.isConnected()) {
      webSocketService.connect();
    }

    // Listen for callback events
    webSocketService.on("azampayCallback", handlePaymentCallback);

    return () => {
      webSocketService.off("azampayCallback", handlePaymentCallback);
    };
  }, [handlePaymentComplete, handlePaymentFailed]);

  // Handle back button
  const handleBack = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="group flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300"
              disabled={isProcessing}
            >
              <div className="mr-2 bg-white p-1.5 rounded-full shadow-sm group-hover:-translate-x-1 transition-all duration-300">
                <ArrowLeft size={16} className="text-blue-600" />
              </div>
              <span className="font-medium">Back to checkout</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-5 px-6">
              <h1 className="text-2xl font-bold text-white">
                Complete Your Payment
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Secure payment via Mobile Money
              </p>
            </div>

            <div className="p-8">
              {!paymentComplete ? (
                <>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">
                          Payment amount (items only)
                        </p>
                        <p className="text-3xl font-bold text-gray-800">
                          TZS {(paymentData?.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-full p-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                      <p className="text-blue-700">
                        Complete your payment to place your order. You'll
                        receive a payment request on your mobile phone. The
                        payment will expire in 2 minutes.
                      </p>
                      <div className="mt-2 text-xs text-blue-600 border-t border-blue-100 pt-2">
                        <p>
                          Note: The payment amount covers the cost of your items
                          only.
                        </p>
                        <p>
                          Delivery fee will be added when creating your order.
                        </p>
                      </div>
                    </div>

                    <PaymentForm
                      amount={paymentData.amount}
                      onPaymentComplete={handlePaymentComplete}
                      onPaymentFailed={handlePaymentFailed}
                      addressId={paymentData.addressId}
                      deliveryOption={paymentData.deliveryOption}
                    />
                  </div>
                </>
              ) : (
                <div
                  className={`rounded-lg ${
                    paymentSuccess ? "bg-green-50" : "bg-red-50"
                  } p-8 transition-all duration-500 animate-fade-in`}
                >
                  <div className="flex items-center justify-center mb-6">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center ${
                        paymentSuccess ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {paymentSuccess ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <h2
                    className={`text-xl font-bold mb-4 text-center ${
                      paymentSuccess ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {paymentSuccess ? "Payment Successful!" : "Payment Failed"}
                  </h2>

                  {paymentSuccess ? (
                    <div className="text-center">
                      <p className="text-green-700 mb-6">
                        Your order has been placed successfully. You will be
                        redirected to your order details page shortly.
                      </p>
                      {orderId && (
                        <button
                          onClick={() => navigate(`/orders/${orderId}`)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                        >
                          View Order Details
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-700 mb-6">
                        There was an issue processing your payment. Please try
                        again or choose a different payment method.
                      </p>
                      <button
                        onClick={handleBack}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                      >
                        Return to Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-gray-500 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure payment processing by Azampay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
