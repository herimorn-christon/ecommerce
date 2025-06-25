import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/products/ProductForm";
import { useAppSelector } from "../../redux/hooks";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");
  const isVerified = profile?.isVerified || false;

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
      return;
    }

    // Redirect to dashboard if profile is not verified
    if (!isVerified) {
      navigate("/seller/dashboard");
    }
  }, [isAuthenticated, isUserSeller, isVerified, navigate]);

  if (!isAuthenticated || !isUserSeller || !isVerified) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode
            ? "Update your product details and information"
            : "Create a new product listing for your store"}
        </p>
      </div>

      <ProductForm isEditMode={isEditMode} />
    </div>
  );
};

export default AddProductPage;
