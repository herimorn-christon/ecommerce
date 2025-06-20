import { Phone } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  checkPaymentStatus,
  initiatePayment,
} from "../../redux/slices/ordersSlice";
import { webSocketService } from "../../services/webSocketService";
import { AzampayCallbackEvent } from "../../types";
import Button from "../common/Button";
import TextField from "../common/TextField";

interface PaymentFormProps {
  amount: number;
  onPaymentComplete: () => void;
  onPaymentFailed?: () => void;
  addressId?: string;
  deliveryOption?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentComplete,
  onPaymentFailed,
  addressId = "",
  deliveryOption = "standard",
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { paymentStatus, isLoading } = useAppSelector((state) => state.orders);

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [phoneError, setPhoneError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [waitingForCallback, setWaitingForCallback] = useState(false);

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for Tanzania phone numbers
    const tanzanianPhoneRegex = /^(255|0)[67]\d{8}$/;
    if (!tanzanianPhoneRegex.test(phone)) {
      setPhoneError(
        "Please enter a valid Tanzanian phone number (e.g., 255712345678)"
      );
      return false;
    }

    setPhoneError("");
    return true;
  };

  // Format phone number to ensure it starts with 255
  const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith("0")) {
      return "255" + phone.substring(1);
    }
    return phone;
  };

  // Check payment status once (used when manually checking)
  const checkPaymentOnce = useCallback(
    async (referenceId: string) => {
      if (!referenceId) return;

      setIsPolling(true);

      try {
        const action = await dispatch(checkPaymentStatus(referenceId));

        if (checkPaymentStatus.fulfilled.match(action)) {
          const result = action.payload;

          if (result.success) {
            // Payment successful
            toast.success("Payment successful!");
            onPaymentComplete();
          } else if (result.message?.toLowerCase().includes("failed")) {
            // Payment failed
            toast.error(result.message || "Payment failed");
            if (onPaymentFailed) {
              onPaymentFailed();
            }
          } else {
            // Still processing
            toast(
              "Payment is still processing. Please wait or check your phone.",
              {
                icon: "⏳",
              }
            );
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        toast.error("Failed to check payment status");
      } finally {
        setIsPolling(false);
      }
    },
    [dispatch, onPaymentComplete, onPaymentFailed]
  );

  // Function to start the 2-minute timer
  const startPaymentTimer = useCallback(
    (referenceId: string) => {
      // Clear any existing timers
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }

      setWaitingForCallback(true);

      // Start with 120 seconds (2 minutes)
      setProcessingTime(120);

      // Create an interval to update the countdown every second
      const countdownInterval = setInterval(() => {
        setProcessingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set the 2-minute timeout
      const timeout = setTimeout(async () => {
        console.log(
          "Payment timeout reached. Checking payment status manually..."
        );
        // Clear the interval
        clearInterval(countdownInterval);

        try {
          // Check payment status after timeout
          const action = await dispatch(checkPaymentStatus(referenceId));

          if (checkPaymentStatus.fulfilled.match(action)) {
            const result = action.payload;

            if (result.success) {
              // Payment successful
              toast.success("Payment successful!");
              onPaymentComplete();
            } else if (result.message?.toLowerCase().includes("failed")) {
              // Payment failed
              toast.error(result.message || "Payment failed");
              if (onPaymentFailed) {
                onPaymentFailed();
              }
            } else {
              // Payment still processing
              toast(
                "Payment is still processing. Please wait or check your phone.",
                {
                  icon: "⏳",
                }
              );
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          toast.error("Failed to check payment status");
        }

        setWaitingForCallback(false);
      }, 120000); // 2 minutes in milliseconds

      setTimeoutRef(timeout);

      return () => {
        clearTimeout(timeout);
        clearInterval(countdownInterval);
      };
    },
    [dispatch, onPaymentComplete, onPaymentFailed, timeoutRef]
  );

  // Function to handle the azampayCallback event
  const handlePaymentCallback = useCallback(
    (data: AzampayCallbackEvent) => {
      console.log("Received azampayCallback:", data);

      // Clear any existing timers
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        setTimeoutRef(null);
      }

      // Process payment result
      if (data.status === "success" && data.transactionId) {
        toast.success("Payment successful!");
        setWaitingForCallback(false);
        onPaymentComplete();
      } else {
        toast.error(`Payment failed: ${data.message}`);
        setWaitingForCallback(false);
        if (onPaymentFailed) {
          onPaymentFailed();
        }
      }
    },
    [onPaymentComplete, onPaymentFailed, timeoutRef]
  );

  // Set up socket event listeners
  useEffect(() => {
    // Ensure we're connected to the socket
    if (!webSocketService.isConnected()) {
      webSocketService.connect();
    }

    // Listen for azampayCallback events
    webSocketService.on("azampayCallback", handlePaymentCallback);

    // Cleanup when component unmounts
    return () => {
      webSocketService.off("azampayCallback", handlePaymentCallback);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [handlePaymentCallback, timeoutRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!validatePhoneNumber(formattedPhone)) {
      return;
    }

    try {
      const result = await dispatch(
        initiatePayment({
          amount,
          phone: formattedPhone,
        })
      ).unwrap();

      // Check for success based on the new API response structure
      if (result.success && result.referenceId) {
        // Log the successful response
        console.log("Payment initiation successful:", result);

        // Emit socket event that we've received the push response
        webSocketService.emit("pushResponseReceived", {
          reference: result.referenceId,
        });

        // Show success toast
        toast.success(result.message || "Payment initiated successfully");

        // Start the 2-minute timer
        startPaymentTimer(result.referenceId);

        // Store the reference ID for later status check
        localStorage.setItem("paymentReferenceId", result.referenceId);

        // Set waiting for callback state
        setWaitingForCallback(true);
      } else {
        toast.error(result.message || "Failed to initiate payment");
        if (onPaymentFailed) {
          onPaymentFailed();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
      if (onPaymentFailed) {
        onPaymentFailed();
      }
    }
  };

  // Render payment status
  const renderPaymentStatus = () => {
    if (!paymentStatus) return null;

    switch (paymentStatus) {
      case "pending":
        return (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl overflow-hidden">
            <div className="bg-blue-100 px-5 py-3 flex items-center">
              <div className="mr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              </div>
              <h4 className="font-medium text-blue-800">Payment in Progress</h4>
            </div>

            <div className="p-5">
              <div className="flex flex-col items-center">
                {waitingForCallback && processingTime > 0 && (
                  <div className="w-full bg-blue-100 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${(processingTime / 120) * 100}%` }}
                    ></div>
                  </div>
                )}

                {waitingForCallback && processingTime > 0 && (
                  <p className="text-sm font-medium text-blue-700 mb-3">
                    Waiting for confirmation ({processingTime}s)
                  </p>
                )}

                <div className="flex items-center justify-center bg-blue-100 rounded-full p-3 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <p className="text-blue-800 font-medium mb-2">
                    Please check your mobile phone
                  </p>
                  <p className="text-blue-700 text-sm">
                    A payment request has been sent to your device. Complete the
                    transaction to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-xl overflow-hidden animate-fade-in">
            <div className="bg-green-100 px-5 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-green-600"
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
              <h4 className="font-medium text-green-800">Payment Successful</h4>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center bg-green-100 rounded-full p-3 mb-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-700">
                  Your payment has been successfully processed. Creating your
                  order...
                </p>
              </div>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl overflow-hidden">
            <div className="bg-red-100 px-5 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-medium text-red-800">Payment Failed</h4>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center bg-red-100 rounded-full p-3 mb-2">
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-red-700 mb-4">
                  Your payment could not be processed. Please try again or use a
                  different payment method.
                </p>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add a manual check function for the "Check Status" button
  const handleCheckStatus = () => {
    const referenceId = localStorage.getItem("paymentReferenceId");
    if (referenceId) {
      checkPaymentOnce(referenceId);
    } else {
      toast.error("No payment reference found");
    }
  };

  return (
    <div>
      {paymentStatus !== "success" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div>
              <TextField
                label="Mobile Money Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 255712345678"
                startIcon={<Phone size={18} />}
                error={phoneError}
                required
                disabled={isLoading || isPolling}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your mobile money number (e.g., M-Pesa, Tigo Pesa, Airtel
                Money)
              </p>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading || isPolling}
                disabled={isLoading || isPolling}
                className="py-3 text-base"
              >
                {isLoading || isPolling
                  ? "Processing..."
                  : "Pay with Mobile Money"}
              </Button>

              {waitingForCallback &&
                localStorage.getItem("paymentReferenceId") && (
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    className="w-full mt-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex justify-center items-center transition-colors"
                  >
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Check Payment Status
                  </button>
                )}
            </div>
          </div>
        </form>
      )}

      {renderPaymentStatus()}
    </div>
  );
};

export default PaymentForm;
