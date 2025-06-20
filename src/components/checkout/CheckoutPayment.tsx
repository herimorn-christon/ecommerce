import React from "react";
import { useAppSelector } from "../../redux/hooks";
import PaymentProcessor from "../payment/PaymentProcessor";

interface CheckoutPaymentProps {
  orderId?: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const { isLoading } = useAppSelector((state) => state.orders);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Complete Your Payment
        </h2>

        <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
          <p className="text-primary-700">
            Your order has been placed! Please complete the payment to confirm
            your order.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="border rounded-md p-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Order Total</span>
                <span className="font-medium">
                  TZS {amount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-800">Amount to Pay</span>
                <span className="font-bold text-blue-700">
                  TZS {amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="md:w-1/2">
            <PaymentProcessor
              amount={amount}
              orderId={orderId}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
