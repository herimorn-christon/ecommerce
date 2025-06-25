import { ShoppingBag } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
    }

    // Redirect if seller profile is not verified
    if (profile && !profile.isVerified) {
      navigate("/seller/dashboard");
    }
  }, [isAuthenticated, isUserSeller, profile, navigate]);

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified))
    return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Manage your customer orders here.</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center h-40 text-gray-400">
          <div className="text-center">
            <ShoppingBag size={48} className="mx-auto mb-2" />
            <p>No orders yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
