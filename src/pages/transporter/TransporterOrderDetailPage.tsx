import {
  AlertCircle,
  ArrowLeft,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import transporterService from "../../services/transporterService";
import { TransporterOrderDetail } from "../../types";

const TransporterOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] =
    useState<TransporterOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await transporterService.getOrderDetails(orderId);
        setOrderDetails(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBackClick = () => {
    navigate("/transporter/deliveries");
  };

  // Get the next status based on current status
  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus.toLowerCase()) {
      case "pending":
        return "processing";
      case "processing":
        return "shipping";
      case "shipping":
        return "delivered";
      default:
        return null;
    }
  };

  // Check if status can be updated
  const canUpdateStatus = (status: string): boolean => {
    return ["pending", "processing", "shipping"].includes(status.toLowerCase());
  };

  // Initialize status update
  const initiateStatusUpdate = () => {
    if (!orderDetails || !orderId) return;

    const next = getNextStatus(orderDetails.status);
    if (!next) {
      toast.error("Cannot update from current status");
      return;
    }

    setNextStatus(next);
    setShowConfirmation(true);
  };

  // Cancel status update
  const cancelStatusUpdate = () => {
    setShowConfirmation(false);
    setNextStatus(null);
  };

  // Handle actual status update
  const handleUpdateStatus = async () => {
    if (!orderDetails || !orderId) return;

    // Determine the next status based on current status
    const next = getNextStatus(orderDetails.status);
    if (!next) {
      toast.error("Cannot update from current status");
      return;
    }

    setUpdatingStatus(true);
    setShowConfirmation(false);

    try {
      const updatedOrder = await transporterService.updateOrderStatus(
        orderId,
        next
      );
      setOrderDetails(updatedOrder);
      toast.success(`Order status updated to ${formatStatus(next)}`);
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
      setNextStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500 mb-4">
          {error || "Could not load order details"}
        </div>
        <Button onClick={handleBackClick} variant="outline" size="small">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deliveries
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          onClick={handleBackClick}
          variant="outline"
          size="small"
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deliveries
        </Button>
        <h1 className="text-2xl font-bold">
          Order #{orderDetails.orderNumber}
        </h1>
        <div
          className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            orderDetails.status
          )}`}
        >
          {formatStatus(orderDetails.status)}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-indigo-600" />
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">{orderDetails.orderNumber}</span>
              </div>

              {orderDetails.trackingNumber && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Tracking Number</span>
                  <span className="font-medium">
                    {orderDetails.trackingNumber}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Created Date</span>
                <span className="font-medium">
                  {formatDate(orderDetails.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">
                  {orderDetails.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Delivery Option</span>
                <span className="font-medium capitalize">
                  {orderDetails.deliveryOption}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold text-lg">
                  TZS {parseFloat(orderDetails.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PackageCheck className="mr-2 h-5 w-5 text-indigo-600" />
              Order Items ({orderDetails.items.length})
            </h2>

            <div className="space-y-6">
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex border-b border-gray-200 pb-4"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium text-gray-900 uppercase">
                        {item.product.name}
                      </h3>
                      <p className="text-right font-medium">
                        TZS {parseFloat(item.unitPrice).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex mt-1 items-end justify-between">
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-right font-medium">
                        TZS{" "}
                        {(
                          parseFloat(item.unitPrice) * item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 truncate">
                      Seller: {item.product.seller.businessName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="mr-2 h-5 w-5 text-indigo-600" />
              Customer Information
            </h2>

            <div className="space-y-3">
              <p className="font-medium">{orderDetails.user.name}</p>
              <p className="text-gray-600">{orderDetails.user.phoneNumber}</p>
              {orderDetails.user.email && (
                <p className="text-gray-600">{orderDetails.user.email}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-indigo-600" />
              Delivery Address
            </h2>

            <div className="space-y-2">
              <p className="font-medium">{orderDetails.address.fullName}</p>
              <p>{orderDetails.address.phoneNumber}</p>
              <p>{orderDetails.address.addressLine1}</p>
              {orderDetails.address.addressLine2 && (
                <p>{orderDetails.address.addressLine2}</p>
              )}
              <p>
                {orderDetails.address.district}, {orderDetails.address.city}
              </p>
              <p>
                {orderDetails.address.region}, {orderDetails.address.country}
              </p>
              {orderDetails.address.postalCode && (
                <p>{orderDetails.address.postalCode}</p>
              )}
            </div>
          </div>

          {/* Status Update Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="mr-2 h-5 w-5 text-indigo-600" />
              Delivery Status
            </h2>

            <div className="space-y-4">
              {orderDetails.status.toLowerCase() === "cancelled" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                  <p className="text-red-800 font-medium">
                    This order has been cancelled
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    No further status updates are allowed for this order.
                  </p>
                </div>
              )}

              {orderDetails.status.toLowerCase() === "delivered" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                  <p className="text-green-800 font-medium">
                    This order has been delivered
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Order was successfully delivered on{" "}
                    {formatDate(orderDetails.updatedAt)}.
                  </p>
                </div>
              )}

              {showConfirmation ? (
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md text-yellow-800">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Confirm Status Update</p>
                        <p className="text-sm mt-1">
                          Are you sure you want to update the order status from{" "}
                          <span className="font-semibold">
                            {formatStatus(orderDetails.status)}
                          </span>{" "}
                          to{" "}
                          <span className="font-semibold">
                            {nextStatus && formatStatus(nextStatus)}
                          </span>
                          ?
                        </p>
                        <p className="text-sm mt-1">
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleUpdateStatus}
                      className="flex-1"
                      isLoading={updatingStatus}
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={cancelStatusUpdate}
                      variant="outline"
                      className="flex-1"
                      disabled={updatingStatus}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Status progress steps */}
                  <div className="mb-6">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          ["processing", "shipping", "delivered"].includes(
                            orderDetails.status.toLowerCase()
                          )
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        1
                      </div>
                      <div
                        className={`h-1 flex-grow ${
                          ["shipping", "delivered"].includes(
                            orderDetails.status.toLowerCase()
                          )
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mx-2 ${
                          ["shipping", "delivered"].includes(
                            orderDetails.status.toLowerCase()
                          )
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        2
                      </div>
                      <div
                        className={`h-1 flex-grow ${
                          orderDetails.status.toLowerCase() === "delivered"
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ml-2 ${
                          orderDetails.status.toLowerCase() === "delivered"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        3
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                      <span>Processing</span>
                      <span>Shipping</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  <Button
                    onClick={initiateStatusUpdate}
                    className="w-full"
                    disabled={
                      updatingStatus || !canUpdateStatus(orderDetails.status)
                    }
                  >
                    {orderDetails.status.toLowerCase() === "pending"
                      ? "Start Processing"
                      : orderDetails.status.toLowerCase() === "processing"
                      ? "Mark as Shipping"
                      : orderDetails.status.toLowerCase() === "shipping"
                      ? "Mark as Delivered"
                      : "Update Status"}
                  </Button>

                  {!canUpdateStatus(orderDetails.status) && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      This order is {formatStatus(orderDetails.status)} and
                      can't be updated further.
                    </p>
                  )}
                </>
              )}

              {orderDetails.notes && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="font-medium mb-2">Delivery Notes:</h3>
                  <p className="text-gray-600">{orderDetails.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterOrderDetailPage;
