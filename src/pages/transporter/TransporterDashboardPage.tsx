import {
  AlertTriangle,
  Clock,
  Package,
  TruckIcon,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isUserTransporter = user?.roles?.includes("transporter");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a transporter
    if (!isAuthenticated || !isUserTransporter) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserTransporter, navigate]);

  if (!isAuthenticated || !isUserTransporter) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Transporter Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your deliveries and track your performance
        </p>
      </div>

      {/* Verification Status */}
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
              Your account is currently pending verification. Once verified, you
              will be able to accept delivery jobs. This usually takes 1-2
              business days.
            </p>
            <p className="text-yellow-700 mt-2">
              Make sure all your information is correct in your profile.
            </p>
          </div>
        </div>
      </div>

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
            <p className="text-3xl font-bold">0</p>
            <p className="text-gray-500 text-sm mt-2">Awaiting pickup</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-yellow-500 mb-4">
              <TruckIcon className="mr-2" size={24} />
              <h3 className="font-medium">In Transit</h3>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-gray-500 text-sm mt-2">Currently delivering</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center text-green-500 mb-4">
              <UserCheck className="mr-2" size={24} />
              <h3 className="font-medium">Delivered</h3>
            </div>
            <p className="text-3xl font-bold">0</p>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Deliveries
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-3 opacity-25" />
            <p className="text-lg">No deliveries yet</p>
            <p className="text-sm mt-1">
              You'll see your delivery history here once you start delivering
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterDashboardPage;
