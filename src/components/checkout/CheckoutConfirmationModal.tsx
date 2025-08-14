import { CreditCard, MapPin, Phone, X } from "lucide-react";
import React from "react";
import Button from "../common/Button";

interface CheckoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderSummary: {
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    subtotal: number;
    shippingFee: number;
    total: number;
  };
  selectedAddress: {
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
  };
  selectedPaymentMethod: "mobile_money" | "card";
  phoneNumber?: string;
  isProcessing?: boolean;
}

const CheckoutConfirmationModal: React.FC<CheckoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderSummary,
  selectedAddress,
  selectedPaymentMethod,
  phoneNumber,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const formatAddress = (address: typeof selectedAddress) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.district,
      address.region,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getPaymentMethodDisplay = () => {
    if (selectedPaymentMethod === "mobile_money") {
      return {
        icon: <Phone className="w-4 h-4" />,
        title: "Mobile Money",
        subtitle: phoneNumber
          ? `${phoneNumber}`
          : "M-Pesa, Tigo Pesa, Airtel Money",
      };
    } else {
      return {
        icon: <CreditCard className="w-4 h-4" />,
        title: "Card Payment",
        subtitle: "Visa, Mastercard via Pesapal",
      };
    }
  };

  const paymentMethodInfo = getPaymentMethodDisplay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Your Order
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Items ({orderSummary.items.length})
            </h3>
            <div className="space-y-3">
              {orderSummary.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    TZS {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-600" />
              Delivery Address
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {selectedAddress.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAddress.phoneNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {formatAddress(selectedAddress)}
                </p>
                {selectedAddress.postalCode && (
                  <p className="text-sm text-gray-600">
                    Postal Code: {selectedAddress.postalCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
              Payment Method
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  {paymentMethodInfo.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {paymentMethodInfo.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {paymentMethodInfo.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  TZS {orderSummary.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="text-gray-900">
                  TZS {orderSummary.shippingFee.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    TZS {orderSummary.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Important Notice
                </p>
                <p className="text-blue-700">
                  By confirming this order, you agree to our terms and
                  conditions. You will be charged the total amount shown above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            fullWidth
            disabled={isProcessing}
            className="sm:flex-1"
          >
            Review Order
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            fullWidth
            isLoading={isProcessing}
            disabled={isProcessing}
            className="sm:flex-1"
          >
            {isProcessing
              ? "Processing..."
              : `Confirm & Pay TZS ${orderSummary.total.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationModal;
