import {
  ArrowLeft,
  Calendar,
  Clipboard,
  Loader2,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchOrderById } from "../../redux/slices/ordersSlice";
import orderService from "../../services/orderService";

const SellerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const { selectedOrder, isLoading, error } = useAppSelector(
    (state) => state.orders
  );
  const isUserSeller = user?.roles?.includes("seller");

  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
      return;
    }

    // Redirect if seller profile is not verified
    if (profile && !profile.isVerified) {
      navigate("/seller/dashboard");
      return;
    }

    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [id, isAuthenticated, isUserSeller, profile, navigate, dispatch]);

  // Get CSS class for order status
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle order status update (this would need to be implemented on the backend)
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder || !id) return;

    setUpdatingStatus(true);
    try {
      // This is a placeholder. You'll need to implement this API endpoint
      await orderService.updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);

      // Refresh order data
      dispatch(fetchOrderById(id));
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Calculate order total
  const calculateTotal = () => {
    if (!selectedOrder?.items) return 0;
    return selectedOrder.items.reduce(
      (total, item) => total + parseInt(item.unitPrice) * item.quantity,
      0
    );
  };

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified))
    return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div>
        <button
          onClick={() => navigate("/seller/orders")}
          className="mb-6 inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Orders
        </button>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-red-200">
          <div className="text-center text-red-500">
            <XCircle size={48} className="mx-auto mb-3" />
            <p>{error || "Order not found"}</p>
            <button
              onClick={() => navigate("/seller/orders")}
              className="mt-4 text-primary-600 hover:text-primary-800"
            >
              Return to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/seller/orders")}
        className="mb-6 inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Orders
      </button>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{selectedOrder.orderNumber}
            </h1>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedOrder.orderNumber);
                toast.success("Order number copied to clipboard");
              }}
              className="text-gray-500 hover:text-gray-700"
              title="Copy order number"
            >
              <Clipboard size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-gray-500" />
            <p className="text-gray-600">
              {new Date(selectedOrder.createdAt).toLocaleDateString()} at{" "}
              {new Date(selectedOrder.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span
            className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusClass(
              selectedOrder.status
            )}`}
          >
            {selectedOrder.status.charAt(0).toUpperCase() +
              selectedOrder.status.slice(1)}
          </span>

          {/* Status update buttons - This would need status update API endpoints */}
          {selectedOrder.status === "pending" && (
            <button
              onClick={() => handleUpdateStatus("processing")}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Mark as Processing
            </button>
          )}

          {selectedOrder.status === "processing" && (
            <button
              onClick={() => handleUpdateStatus("shipped")}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Mark as Shipped
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>

            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.product.images &&
                        item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">
                              {item.product.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            TZS {parseInt(item.unitPrice).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>TZS {calculateTotal().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <User size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-900 font-medium">
                  {selectedOrder.user?.name || selectedOrder.address.fullName}
                </span>
              </div>
              <div className="flex items-center mb-4">
                <Phone size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-900">
                  {selectedOrder.user?.phoneNumber ||
                    selectedOrder.address.phoneNumber}
                </span>
              </div>
              <div className="flex items-start">
                <MapPin size={16} className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-900">
                    {selectedOrder.address.addressLine1}
                  </p>
                  {selectedOrder.address.addressLine2 && (
                    <p className="text-gray-900">
                      {selectedOrder.address.addressLine2}
                    </p>
                  )}
                  <p className="text-gray-900">
                    {selectedOrder.address.city}, {selectedOrder.address.region}
                  </p>
                  <p className="text-gray-900">
                    {selectedOrder.address.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Shipping</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Truck size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-900 font-medium capitalize">
                  {selectedOrder.deliveryOption} Delivery
                </span>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="flex items-center">
                  <Clipboard size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-900">
                    Tracking: {selectedOrder.trackingNumber}
                  </span>
                </div>
              )}

              {!selectedOrder.trackingNumber &&
                selectedOrder.status === "processing" && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Add tracking number
                    </p>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter tracking number"
                        className="flex-1 border border-gray-300 rounded-l-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button className="bg-primary-600 text-white px-3 py-2 rounded-r-md text-sm hover:bg-primary-700">
                        Save
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetailPage;
