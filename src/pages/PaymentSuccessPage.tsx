import {
  ArrowRight,
  CheckCircle,
  Home,
  Package,
  Receipt,
  Truck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

interface PaymentSuccessPageProps {}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Get payment details from URL params
  const transactionId = searchParams.get("transactionId");
  const paymentMethod = searchParams.get("paymentMethod");
  const amount = searchParams.get("amount");

  useEffect(() => {
    // Simulate loading order details
    const timer = setTimeout(() => {
      setOrderDetails({
        orderId: orderId || `ORDER-${Date.now()}`,
        transactionId: transactionId || `TXN-${Date.now()}`,
        amount: amount || "0",
        paymentMethod: paymentMethod || "Unknown",
        estimatedDelivery: "3-5 business days",
        trackingNumber: `TF${Date.now().toString().slice(-6)}`,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, transactionId, amount, paymentMethod]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. Your payment has been processed
            successfully.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-gray-600" />
              Order Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold text-gray-900">
                {orderDetails.orderId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-semibold text-gray-900">
                {orderDetails.transactionId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="font-semibold text-gray-900">
                TZS {parseInt(orderDetails.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-900 capitalize">
                {orderDetails.paymentMethod.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-semibold text-gray-900">
                {orderDetails.trackingNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">
                {orderDetails.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Payment Confirmed</p>
                <p className="text-sm text-gray-500">
                  Your payment has been processed
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-500">
                  Your order is being prepared by the seller
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600">Shipping Soon</p>
                <p className="text-sm text-gray-500">
                  Your order will be shipped within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Receipt className="w-5 h-5 text-blue-600 mt-1" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Order Confirmation Sent
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                We've sent an order confirmation and receipt to your email
                address. Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="flex-1">
            <Button
              variant="primary"
              fullWidth
              className="flex items-center justify-center"
            >
              <Package className="w-4 h-4 mr-2" />
              Track Your Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link to="/" className="flex-1">
            <Button
              variant="outline"
              fullWidth
              className="flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@tanfishmarket.com"
              className="text-primary-600 hover:text-primary-700"
            >
              support@tanfishmarket.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+255123456789"
              className="text-primary-600 hover:text-primary-700"
            >
              +255 123 456 789
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
