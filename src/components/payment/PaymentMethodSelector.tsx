import {
  CreditCard,
  ExternalLink,
  Loader2,
  Phone,
  RefreshCw,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "../../redux/hooks";
import paymentService from "../../services/paymentService";
import Button from "../common/Button";
import TextField from "../common/TextField";

interface PaymentMethodSelectorProps {
  amount: number;
  addressId: string;
  onPaymentComplete: (transactionId: string) => void;
  onPaymentFailed?: () => void;
}

interface SelectedAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  district: string;
  postalCode?: string;
  country: string;
}

// todo(Muneersahel): before checkout show confirmation dialog with selected address and payment method before proceeding
// todo(Muneersahel): on successfull payment, show page to the user that payment was successful

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  addressId,
  onPaymentComplete,
  onPaymentFailed,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { addresses } = useAppSelector((state) => state.address);

  const [selectedMethod, setSelectedMethod] = useState<
    "mobile_money" | "card" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [phoneError, setPhoneError] = useState("");

  // Pesapal specific states
  const [pesapalOrderId, setPesapalOrderId] = useState<string | null>(null);
  const [pesapalRedirectUrl, setPesapalRedirectUrl] = useState<string | null>(
    null
  );
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showStatusCheck, setShowStatusCheck] = useState(false);

  // Get selected address details
  const selectedAddress = addresses.find((addr) => addr.id === addressId) as
    | SelectedAddress
    | undefined;

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
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

  // Handle mobile money payment
  const handleMobileMoneyPayment = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!validatePhoneNumber(formattedPhone)) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await paymentService.initiatePayment(
        amount,
        formattedPhone
      );

      if (result.success && result.referenceId) {
        toast.success(result.message || "Payment initiated successfully");
        // Store reference for potential status checking
        localStorage.setItem("azampayReferenceId", result.referenceId);
        // In a real implementation, you'd handle the payment flow here
        // For now, we'll simulate success after a delay
        setTimeout(() => {
          onPaymentComplete(result.transactionId);
        }, 2000);
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
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle card payment (Pesapal)
  const handleCardPayment = async () => {
    if (!selectedAddress) {
      toast.error("Address information is required for card payment");
      return;
    }

    if (!user?.email) {
      toast.error("Email address is required for card payment");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        amount: amount,
        currency: "TZS",
        description: `Payment for order #${Date.now()}`,
        callbackUrl: `${window.location.origin}/payment/success`,
        billingAddress: {
          phone_number: selectedAddress.phoneNumber,
          email_address: user.email,
          country_code: "TZ",
          first_name: selectedAddress.fullName.split(" ")[0] || "",
          middle_name: selectedAddress.fullName.split(" ")[1] || "",
          last_name:
            selectedAddress.fullName.split(" ").slice(2).join(" ") ||
            selectedAddress.fullName.split(" ")[1] ||
            "",
          line_1: selectedAddress.addressLine1,
          line_2: selectedAddress.addressLine2 || "",
          city: selectedAddress.city,
          state: selectedAddress.region,
          postal_code: selectedAddress.postalCode || "00000",
          zip_code: selectedAddress.postalCode || "00000",
        },
        cancellationUrl: `${window.location.origin}/payment/cancelled`,
        branch: "Tanfishmarket Website",
      };

      const result = await paymentService.createPesapalOrder(orderData);

      if (result.status === "200" && result.redirect_url) {
        setPesapalOrderId(result.order_tracking_id);
        setPesapalRedirectUrl(result.redirect_url);
        setShowStatusCheck(true);

        // Open payment page in new window/tab
        window.open(result.redirect_url, "_blank");

        toast.success(
          "Payment page opened. Please complete your payment and click 'Check Payment Status' when done."
        );
      } else {
        toast.error(result.error || "Failed to create payment order");
        if (onPaymentFailed) {
          onPaymentFailed();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create payment order");
      if (onPaymentFailed) {
        onPaymentFailed();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check Pesapal payment status
  const checkPesapalStatus = async () => {
    if (!pesapalOrderId) {
      toast.error("No order tracking ID found");
      return;
    }

    setIsCheckingStatus(true);

    try {
      const result = await paymentService.checkPesapalTransactionStatus(
        pesapalOrderId
      );

      if (result.status === "200") {
        if (result.payment_status_description === "Completed") {
          toast.success("Payment completed successfully!");
          onPaymentComplete(result.merchant_reference);
        } else if (result.payment_status_description === "Failed") {
          toast.error("Payment failed. Please try again.");
          if (onPaymentFailed) {
            onPaymentFailed();
          }
        } else {
          toast(`Payment status: ${result.payment_status_description}`, {
            icon: "⏳",
          });
        }
      } else {
        toast.error("Failed to check payment status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to check payment status");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (!selectedMethod) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Choose Payment Method
          </h3>
          <p className="text-gray-600 mb-6">
            Select your preferred payment method to complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mobile Money Option */}
          <div
            onClick={() => setSelectedMethod("mobile_money")}
            className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Mobile Money</h4>
                <p className="text-sm text-gray-600">
                  Pay with M-Pesa, Tigo Pesa, Airtel Money
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • Instant payment processing • Secure and trusted • Widely
              accepted in Tanzania
            </div>
          </div>

          {/* Card Payment Option */}
          <div
            onClick={() => setSelectedMethod("card")}
            className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Card Payment</h4>
                <p className="text-sm text-gray-600">
                  Pay with Visa, Mastercard, or other cards
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • International cards accepted • Secure payment processing •
              Powered by Pesapal
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMethod === "mobile_money") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Mobile Money Payment
          </h3>
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Change Method
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">
              Mobile Money Payment
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You'll receive a prompt on your phone to complete the payment
          </p>
        </div>

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
            disabled={isProcessing}
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter your mobile money number (M-Pesa, Tigo Pesa, Airtel Money)
          </p>
        </div>

        <Button
          onClick={handleMobileMoneyPayment}
          variant="primary"
          fullWidth
          isLoading={isProcessing}
          disabled={isProcessing}
          className="py-3 text-base"
        >
          {isProcessing
            ? "Processing Payment..."
            : `Pay TZS ${amount.toLocaleString()}`}
        </Button>
      </div>
    );
  }

  if (selectedMethod === "card") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Card Payment</h3>
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Change Method
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">
              Secure Card Payment
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            You'll be redirected to a secure payment page to complete your
            payment
          </p>
        </div>

        {!showStatusCheck ? (
          <Button
            onClick={handleCardPayment}
            variant="primary"
            fullWidth
            isLoading={isProcessing}
            disabled={isProcessing}
            className="py-3 text-base"
          >
            {isProcessing
              ? "Creating Payment Order..."
              : `Pay TZS ${amount.toLocaleString()}`}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExternalLink className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">
                  Payment in Progress
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your payment in the opened window, then click the
                button below to check status
              </p>
            </div>

            {pesapalRedirectUrl && (
              <Button
                onClick={() => window.open(pesapalRedirectUrl, "_blank")}
                variant="outline"
                fullWidth
                className="py-2"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Payment Page Again
              </Button>
            )}

            <Button
              onClick={checkPesapalStatus}
              variant="primary"
              fullWidth
              isLoading={isCheckingStatus}
              disabled={isCheckingStatus}
              className="py-3 text-base"
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Payment Status...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Payment Status
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentMethodSelector;
