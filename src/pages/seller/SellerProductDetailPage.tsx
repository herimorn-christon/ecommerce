import { Edit, Package, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAppSelector } from "../../redux/hooks";
import productService from "../../services/productService";
import { Product } from "../../types";

const SellerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch product details
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await productService.getProductById(id);

        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAuthenticated, isUserSeller, profile, navigate]);

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!product) return;

    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await productService.deleteProduct(product.id);
        toast.success("Product deleted successfully");
        navigate("/seller/products");
      } catch (err) {
        console.error("Failed to delete product:", err);
        toast.error("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-500">
          <p>{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/seller/products")}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-2">Product ID: {product.id}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/seller/products/edit/${product.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Edit size={16} className="mr-2" />
            Edit Product
          </button>
          <button
            onClick={handleDeleteProduct}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-gray-50"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="md:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Product Images
            </h3>
          </div>
          <div className="p-6">
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="border border-gray-200 rounded-md overflow-hidden aspect-square"
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 border border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <Package size={48} className="mx-auto mb-2" />
                  <p>No product images available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Product Details
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm text-gray-500">Price</h4>
              <p className="text-lg font-semibold text-gray-900">
                TZS {parseInt(product.unitPrice).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Category</h4>
              <p className="text-gray-900">
                {product.category?.name || "Uncategorized"}
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Status</h4>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Storage Type</h4>
              <p className="text-gray-900 capitalize">{product.storageType}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Inventory</h4>
              <div className="flex justify-between items-center">
                <p className="text-gray-900">
                  {product.availableQuantity} in stock
                </p>
                {product.availableQuantity <= product.alertQuantity && (
                  <span className="text-xs text-red-600 font-medium">
                    Low stock
                  </span>
                )}
              </div>
              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 ${
                    product.availableQuantity <= product.alertQuantity
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (product.availableQuantity /
                        (product.alertQuantity * 5)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Alert when stock reaches {product.alertQuantity} units
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Sales</h4>
              <p className="text-gray-900">{product.soldQuantity} units sold</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Created</h4>
              <p className="text-gray-900">
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Last Updated</h4>
              <p className="text-gray-900">
                {new Date(product.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Description</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetailPage;
