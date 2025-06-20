import { BarChart3, Package, ShoppingBag, Truck, Users } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isUserSeller = user?.roles?.includes("seller");

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserSeller, navigate]);

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's an overview of your seller
          activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Products"
          value="0"
          description="Active products"
          icon={<Package className="h-6 w-6 text-primary-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Orders"
          value="0"
          description="Pending orders"
          icon={<ShoppingBag className="h-6 w-6 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Revenue"
          value="$0"
          description="Last 30 days"
          icon={<BarChart3 className="h-6 w-6 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Customers"
          value="0"
          description="Total customers"
          icon={<Users className="h-6 w-6 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button className="text-sm text-primary-600 hover:text-primary-800">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 text-sm text-gray-500" colSpan={5}>
                  No recent orders found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            title="Add New Product"
            description="List a new product for sale"
            icon={<Package className="h-5 w-5" />}
          />
          <ActionButton
            title="Process Orders"
            description="View and update order status"
            icon={<Truck className="h-5 w-5" />}
          />
          <ActionButton
            title="View Analytics"
            description="See detailed sales reports"
            icon={<BarChart3 className="h-5 w-5" />}
          />
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
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => {
  return (
    <div className={`rounded-lg shadow p-6 ${color} border border-gray-200`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="rounded-full bg-primary-100 p-3 mr-3">{icon}</div>
      <div className="text-left">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
};

export default DashboardPage;
