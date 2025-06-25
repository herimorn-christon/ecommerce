import { Package, Plus } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const SellerProductsPage: React.FC = () => {
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
          <Plus size={16} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center h-40 text-gray-400">
          <div className="text-center">
            <Package size={48} className="mx-auto mb-2" />
            <p>No products yet</p>
            <p className="text-sm mt-1">
              Add your first product to start selling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductsPage;
