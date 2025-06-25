import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Home,
  Info,
  Package,
  PackageX,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSellerProfile } from "../redux/slices/sellerSlice";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const {
    profile,
    isLoading: isProfileLoading,
    hasCheckedProfile,
  } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserSeller, navigate]);

  // Fetch seller profile
  useEffect(() => {
    if (isAuthenticated && isUserSeller && !hasCheckedProfile) {
      dispatch(fetchSellerProfile());
    }
  }, [dispatch, isAuthenticated, isUserSeller, hasCheckedProfile]);

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller) return null;

  // Handle create profile button click
  const handleCreateProfile = () => {
    toast.success("Please complete your seller profile", {
      duration: 4000,
      position: "bottom-right",
    });
    navigate("/seller-profile/create");
  };

  // Mock data - in real app, this would come from API
  const todaySales = 2450000; // TZS
  const newOrders = 12;
  const totalProducts = 45;
  const lowStockProducts = 8;

  // Mock recent orders data
  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Makena",
      date: "2025-06-25",
      amount: 125000,
      status: "pending",
      items: 3,
    },
    {
      id: "ORD-002",
      customer: "Mary Johnson",
      date: "2025-06-25",
      amount: 85000,
      status: "processing",
      items: 2,
    },
    {
      id: "ORD-003",
      customer: "David Wilson",
      date: "2025-06-24",
      amount: 200000,
      status: "shipped",
      items: 5,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600 flex items-center">
            <Home size={16} className="mr-1" />
            Home
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">Dashboard</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mt-2">
              Welcome back, {user.name}! Here's an overview of your activities
              for today.
            </p>
          )}

          {/* No Seller Profile Alert */}
          {hasCheckedProfile && !profile && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 flex items-start">
              <AlertCircle
                className="text-amber-500 mr-3 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <h3 className="font-medium text-amber-800">
                  Complete your seller profile
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You need to complete your seller profile before you can start
                  selling products.
                </p>
                <button
                  onClick={handleCreateProfile}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Store className="mr-2 h-4 w-4" /> Complete Your Profile
                </button>
              </div>
            </div>
          )}

          {/* Profile Not Verified Alert */}
          {hasCheckedProfile && profile && !profile.isVerified && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 flex items-start">
              <Info
                className="text-blue-500 mr-3 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <h3 className="font-medium text-blue-800">
                  Profile Verification Pending
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your profile is currently under review. You'll be able to
                  start selling once your profile has been verified by our team.
                  This usually takes 1-2 business days.
                </p>
                <div className="mt-3 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-400"></span>
                    Verification in progress
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Show loading state while checking profile */}
          {isProfileLoading && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Checking seller profile status...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {profile && profile.isVerified ? (
            <>
              <StatCard
                title="Today's Sales"
                value={formatCurrency(todaySales)}
                description="Revenue earned today"
                icon={<TrendingUp className="h-6 w-6 text-green-600" />}
                color="bg-green-50"
                trend="+12.5%"
              />
              <StatCard
                title="New Orders"
                value={newOrders.toString()}
                description="Orders received today"
                icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
                color="bg-blue-50"
                trend="+8 from yesterday"
              />
              <StatCard
                title="Total Products"
                value={totalProducts.toString()}
                description="Active listings"
                icon={<Package className="h-6 w-6 text-primary-600" />}
                color="bg-primary-50"
                trend="3 added this week"
              />
              <StatCard
                title="Low Stock Alert"
                value={lowStockProducts.toString()}
                description="Products need restocking"
                icon={<PackageX className="h-6 w-6 text-red-600" />}
                color="bg-red-50"
                trend="Needs attention"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Profile Status"
                value={!profile ? "Incomplete" : "Pending"}
                description={
                  !profile
                    ? "Create your seller profile"
                    : "Verification in progress"
                }
                icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
                color="bg-amber-50"
                trend={profile ? "Usually takes 1-2 days" : "Required to sell"}
              />
              <StatCard
                title="Next Step"
                value={!profile ? "Create Profile" : "Wait for Approval"}
                description={
                  !profile ? "Click below to start" : "We'll notify you"
                }
                icon={<Store className="h-6 w-6 text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                title="Seller Features"
                value="Coming Soon"
                description="Once profile is verified"
                icon={<Package className="h-6 w-6 text-gray-600" />}
                color="bg-gray-50"
              />
              <StatCard
                title="Support"
                value="Available"
                description="Contact us with questions"
                icon={<Info className="h-6 w-6 text-primary-600" />}
                color="bg-primary-50"
                trend="24/7 support"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          {!profile || (profile && !profile.isVerified) ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {!profile
                  ? "Complete your profile"
                  : "Profile verification pending"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {!profile
                  ? "You need to complete your seller profile before you can access seller features."
                  : "You'll have full access to seller features once your profile has been verified."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton
                title="Add Product"
                description="Add new product to inventory"
                icon={<Plus className="h-5 w-5" />}
                onClick={() => console.log("Add Product")}
              />
              <ActionButton
                title="Reports"
                description="View sales and performance reports"
                icon={<BarChart3 className="h-5 w-5" />}
                onClick={() => console.log("Reports")}
              />
              <ActionButton
                title="Inventory"
                description="Manage product stock levels"
                icon={<Warehouse className="h-5 w-5" />}
                onClick={() => console.log("Inventory")}
              />
              <ActionButton
                title="Analytics"
                description="Detailed analytics dashboard"
                icon={<TrendingUp className="h-5 w-5" />}
                onClick={() => console.log("Analytics")}
              />
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>
            {profile && profile.isVerified && (
              <Link
                to="/orders"
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View all orders
              </Link>
            )}
          </div>

          {!profile || (profile && !profile.isVerified) ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {!profile
                  ? "Complete your seller profile"
                  : "Waiting for verification"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {!profile
                  ? "You'll be able to see your orders after completing your seller profile"
                  : "Your order data will be available once your seller profile is verified"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-4 text-sm text-gray-500 text-center"
                        colSpan={7}
                      >
                        No recent orders found
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
  trend,
}) => {
  return (
    <div className={`rounded-lg shadow-sm p-6 ${color} border border-gray-200`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
          {trend && (
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
              {trend}
            </p>
          )}
        </div>
        <div className="ml-4">{icon}</div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all duration-200 text-left w-full"
    >
      <div className="rounded-full bg-primary-100 p-3 mr-4 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
};

export default DashboardPage;
