import { CheckCircle, Phone, XCircle } from "lucide-react";
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

interface AzamPayCheckoutProps {
  amount: number;
  onPaymentComplete: () => void;
  onPaymentFailed: () => void;
  addressId?: string;
  deliveryOption?: string;
}

const AzamPayCheckout: React.FC<AzamPayCheckoutProps> = ({
  amount,
  onPaymentComplete,
  onPaymentFailed,
  addressId = "",
  deliveryOption = "standard",
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { paymentReference, paymentStatus, isLoading } = useAppSelector(
    (state) => state.orders
  );

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [phoneError, setPhoneError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [processingTime, setProcessingTime] = useState(0); // For countdown timer
  const [waitingForCallback, setWaitingForCallback] = useState(false);

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for Tanzania phone numbers
    const tanzanianPhoneRegex = /^(255|0)[67]\\d{8}$/;
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

  // Poll for payment status
  const pollPaymentStatus = useCallback(
    (referenceId: string) => {
      if (!referenceId) return;

      setIsPolling(true);

      const interval = setInterval(async () => {
        try {
          const action = await dispatch(checkPaymentStatus(referenceId));

          if (checkPaymentStatus.fulfilled.match(action)) {
            const result = action.payload;

            if (result.success) {
              // Payment successful
              clearInterval(interval);
              setIsPolling(false);

              // Store transaction ID for order creation
              if (result.transactionId) {
                localStorage.setItem("transactionId", result.transactionId);
              }

              toast.success("Payment completed successfully!");
              onPaymentComplete();
            } else if (result.message?.toLowerCase().includes("failed")) {
              // Payment failed
              clearInterval(interval);
              setIsPolling(false);

              toast.error(`Payment failed: ${result.message}`);
              onPaymentFailed();
            }
          }
        } catch (error) {
          console.error("Error polling payment status:", error);
        }
      }, 5000); // Check every 5 seconds

      // Clean up interval on component unmount
      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    },
    [dispatch, onPaymentComplete, onPaymentFailed]
  );

  // Start polling when payment reference is available
  useEffect(() => {
    if (paymentReference && paymentStatus === "pending" && !isPolling) {
      const cleanup = pollPaymentStatus(paymentReference);
      return cleanup;
    }
  }, [paymentReference, paymentStatus, isPolling, pollPaymentStatus]);

  // Handle payment initiation
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

        // Start polling for payment status as a backup
        pollPaymentStatus(result.referenceId);

        // Set waiting for callback state
        setWaitingForCallback(true);
      } else {
        toast.error(result.message || "Failed to initiate payment");
        onPaymentFailed();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
      onPaymentFailed();
    }
  };

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
      const timeout = setTimeout(() => {
        console.log(
          "Payment timeout reached. Checking payment status manually..."
        );
        // Clear the interval
        clearInterval(countdownInterval);

        // Check payment status
        dispatch(checkPaymentStatus(referenceId));

        setWaitingForCallback(false);
      }, 120000); // 2 minutes in milliseconds

      setTimeoutRef(timeout);

      return () => {
        clearTimeout(timeout);
        clearInterval(countdownInterval);
      };
    },
    [dispatch, timeoutRef]
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
        // Store transaction ID for order creation
        localStorage.setItem("transactionId", data.transactionId);

        toast.success("Payment successful!");
        setWaitingForCallback(false);
        onPaymentComplete();
      } else {
        toast.error(`Payment failed: ${data.message}`);
        setWaitingForCallback(false);
        onPaymentFailed();
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

  // Render payment status
  const renderPaymentStatus = () => {
    if (!paymentStatus) return null;

    switch (paymentStatus) {
      case "pending":
        return (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              </div>
              <p className="text-center font-medium">Payment processing...</p>
              {waitingForCallback && processingTime > 0 && (
                <p className="text-sm mt-1">
                  Waiting for confirmation ({processingTime}s)
                </p>
              )}
              <p className="text-center text-sm mt-2">
                Please check your phone for the payment prompt and complete the
                transaction.
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
            <div className="flex flex-col items-center">
              <CheckCircle size={24} className="mb-2" />
              <p className="text-center font-medium">Payment successful!</p>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            <div className="flex flex-col items-center">
              <XCircle size={24} className="mb-2" />
              <p className="text-center font-medium">
                Payment failed. Please try again.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        AzamPay Mobile Money Payment
      </h3>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Amount to pay:</p>
          <p className="text-xl font-bold text-blue-700">
            TZS {amount.toLocaleString()}
          </p>
        </div>
      </div>

      {paymentStatus !== "success" && (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="mt-1 text-sm text-gray-500">
              Enter your mobile money number (e.g., M-Pesa, Tigo Pesa, Airtel
              Money)
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading || isPolling}
            disabled={isLoading || isPolling}
          >
            {isLoading || isPolling ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      )}

      {renderPaymentStatus()}
    </div>
  );
};

export default AzamPayCheckout;
