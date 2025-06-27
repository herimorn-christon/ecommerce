import {
  AlertTriangle,
  Clock,
  Package,
  TruckIcon,
  UserCheck,
} from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchCurrentTransporter,
  fetchTransporterOrders,
} from "../../redux/slices/transporterSlice";

const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { orders, ordersCount, isLoading, selectedTransporter } =
    useAppSelector((state) => state.transporter);
  const isUserTransporter = user?.roles?.includes("transporter");

  // Count orders by status
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const inTransitOrders = orders.filter(
    (order) => order.status === "in_transit"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  useEffect(() => {
    // Redirect if not authenticated or not a transporter
    if (!isAuthenticated || !isUserTransporter) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserTransporter, navigate]);

  // Fetch orders and transporter data on component mount
  useEffect(() => {
    if (isAuthenticated && isUserTransporter) {
      dispatch(fetchTransporterOrders());
      dispatch(fetchCurrentTransporter());
    }
  }, [dispatch, isAuthenticated, isUserTransporter]);

  if (!isAuthenticated || !isUserTransporter) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {selectedTransporter?.businessName
            ? `${selectedTransporter.businessName} Dashboard`
            : "Transporter Dashboard"}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your deliveries and track your performance
        </p>
      </div>

      {/* Verification Status */}
      {selectedTransporter && !selectedTransporter.isVerified && (
        <div className="mb-8">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertTriangle
              size={24}
              className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
            />
            <div>
              <h3 className="font-medium text-yellow-800">
                Verification Required
              </h3>
              <p className="text-yellow-700 mt-1">
                Your account is currently pending verification. Once verified,
                you will be able to accept delivery jobs. This usually takes 1-2
                business days.
              </p>
              <p className="text-yellow-700 mt-2">
                Make sure all your information is correct in your profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Delivery Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-blue-500 mb-4">
              <Package className="mr-2" size={24} />
              <h3 className="font-medium">Pending</h3>
            </div>
            <p className="text-3xl font-bold">{pendingOrders}</p>
            <p className="text-gray-500 text-sm mt-2">Awaiting pickup</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-yellow-500 mb-4">
              <TruckIcon className="mr-2" size={24} />
              <h3 className="font-medium">In Transit</h3>
            </div>
            <p className="text-3xl font-bold">{inTransitOrders}</p>
            <p className="text-gray-500 text-sm mt-2">Currently delivering</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-green-500 mb-4">
              <UserCheck className="mr-2" size={24} />
              <h3 className="font-medium">Delivered</h3>
            </div>
            <p className="text-3xl font-bold">{deliveredOrders}</p>
            <p className="text-gray-500 text-sm mt-2">Successfully completed</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-purple-500 mb-4">
              <Clock className="mr-2" size={24} />
              <h3 className="font-medium">Average Time</h3>
            </div>
            <p className="text-3xl font-bold">-</p>
            <p className="text-gray-500 text-sm mt-2">Delivery completion</p>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Deliveries
          </h2>
          {orders.length > 0 && (
            <button
              onClick={() => navigate("/transporter/deliveries")}
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
            >
              View all deliveries
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Loading deliveries...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-25" />
              <p className="text-lg">No deliveries yet</p>
              <p className="text-sm mt-1">
                You'll see your delivery history here once you start delivering
              </p>
            </div>
          ) : (
            <div className="p-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center">
                    <Package className="mr-3 text-gray-400" size={24} />
                    <div>
                      <p className="text-gray-800 font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} -{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold rounded-full px-3 py-1 ${
                        order.status === "pending"
                          ? "bg-blue-100 text-blue-600"
                          : order.status === "in_transit"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {order.status.replace("_", " ").toUpperCase()}
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/transporter/orders/${order.id}`)
                      }
                      className="ml-4 text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              {orders.length > 5 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate("/transporter/deliveries")}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    View {orders.length - 5} more deliveries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransporterDashboardPage;
