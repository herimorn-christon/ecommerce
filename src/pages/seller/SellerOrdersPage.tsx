import {
  ArrowRight,
  BarChart,
  Filter,
  Loader2,
  Package,
  RefreshCcw,
  Search,
  ShoppingBag,
  TruckIcon,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchSellerOrders } from "../../redux/slices/ordersSlice";

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const { sellerOrders, isLoading, error } = useAppSelector(
    (state) => state.orders
  );
  const isUserSeller = user?.roles?.includes("seller");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Filter orders based on search query and status filter
  const filteredOrders = sellerOrders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address?.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filterStatus || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Summary card calculation
  const orderSummary = {
    total: sellerOrders.length,
    pending: sellerOrders.filter((order) => order.status === "pending").length,
    processing: sellerOrders.filter((order) => order.status === "processing")
      .length,
    inTransit: sellerOrders.filter((order) => order.status === "shipping")
      .length,
    delivered: sellerOrders.filter((order) => order.status === "delivered")
      .length,
    cancelled: sellerOrders.filter((order) => order.status === "cancelled")
      .length,
    estimatedRevenue: sellerOrders
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => {
        const totalOrderAmount = order.items.reduce(
          (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
          0
        );

        return total + totalOrderAmount;
      }, 0),
  };

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

    // Fetch seller orders
    dispatch(fetchSellerOrders());
  }, [isAuthenticated, isUserSeller, profile, navigate, dispatch]);

  // Handle refresh orders list
  const handleRefresh = () => {
    dispatch(fetchSellerOrders());
  };

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

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified))
    return null;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer orders here.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <RefreshCcw size={16} className="mr-2" />
          )}
          Refresh
        </button>
      </div>

      {/* Order Summary Cards */}
      <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Loading...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <ShoppingBag size={16} className="mr-1.5 text-primary-500" />
                Total Orders
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {orderSummary.total}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">All time orders</p>
                <button
                  onClick={() => setFilterStatus("")}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-800"
                >
                  View all
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <Package size={16} className="mr-1.5 text-yellow-500" />
                Pending Orders
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {orderSummary.pending}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Need attention</p>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className="flex items-center text-xs text-yellow-600 hover:text-yellow-800"
                >
                  View orders
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <TruckIcon size={16} className="mr-1.5 text-blue-500" />
                In Transit
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {orderSummary.processing + orderSummary.inTransit}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Processing & shipping</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterStatus("processing")}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    Processing
                    <ArrowRight size={12} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart size={16} className="mr-1.5 text-green-500" />
                Sales Revenue
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                TZS {orderSummary.estimatedRevenue.toLocaleString()}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  From {orderSummary.total} orders
                </p>
                <button
                  onClick={() => setFilterStatus("delivered")}
                  className="flex items-center text-xs text-green-600 hover:text-green-800"
                >
                  Completed
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order number or customer name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md appearance-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipping">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {isLoading && !sellerOrders.length ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <Loader2
                size={48}
                className="mx-auto mb-3 animate-spin text-primary-600"
              />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-red-200">
          <div className="text-center text-red-500">
            <XCircle size={48} className="mx-auto mb-3" />
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-primary-600 hover:text-primary-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40 text-gray-400">
            <div className="text-center">
              <ShoppingBag size={48} className="mx-auto mb-2" />
              <p>
                {searchQuery || filterStatus
                  ? "No orders match your filters"
                  : "No orders yet"}
              </p>
              {(searchQuery || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("");
                  }}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                  >
                    {/* Order Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.deliveryOption.charAt(0).toUpperCase() +
                          order.deliveryOption.slice(1)}{" "}
                        Delivery
                      </div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || order.address.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.phoneNumber}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {order.address.addressLine1}, {order.address.city}
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div
                              key={item.id}
                              className="h-8 w-8 rounded-md border border-white overflow-hidden"
                              style={{ zIndex: 10 - index }}
                            >
                              {item.product.images &&
                              item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                  <Package
                                    size={12}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="h-8 w-8 rounded-md bg-gray-200 border border-white flex items-center justify-center text-xs font-medium text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {order.items.length} item(s)
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
