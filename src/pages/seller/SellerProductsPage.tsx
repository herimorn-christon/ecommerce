import {
  ArrowRight,
  BarChart3,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import productService from "../../services/productService";
import { Product } from "../../types";

const SellerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all"); // 'all', 'active', 'inactive', 'lowStock'

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

    // Fetch seller's products
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getMyProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again.");
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated, isUserSeller, profile, navigate]);

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        setIsLoading(true);
        await productService.deleteProduct(productId);
        toast.success("Product deleted successfully");
        // Refresh the product list
        const updatedProducts = products.filter(
          (product) => product.id !== productId
        );
        setProducts(updatedProducts);
      } catch (err) {
        console.error("Failed to delete product:", err);
        toast.error("Failed to delete product");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified))
    return null;

  // Calculate product summary statistics
  const productSummary = {
    total: products.length,
    active: products.filter((product) => product.isActive).length,
    inactive: products.filter((product) => !product.isActive).length,
    lowStock: products.filter(
      (product) => product.availableQuantity <= product.alertQuantity
    ).length,
    totalValue: products.reduce(
      (sum, product) =>
        sum + parseInt(product.unitPrice) * product.availableQuantity,
      0
    ),
  };

  // Apply filters to products
  const filteredProducts = products.filter((product) => {
    switch (filter) {
      case "active":
        return product.isActive;
      case "inactive":
        return !product.isActive;
      case "lowStock":
        return product.availableQuantity <= product.alertQuantity;
      default:
        return true; // 'all' filter
    }
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <button
          onClick={() => navigate("/seller/products/add")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus size={16} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Product Summary Cards */}
      <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Product Summary
            </h3>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Loading...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Products Card */}
            <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <Package size={16} className="mr-1.5 text-primary-500" />
                Total Products
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {productSummary.total}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {productSummary.active} active · {productSummary.inactive}{" "}
                  inactive
                </p>
                <button
                  onClick={() => setFilter("all")}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-800"
                >
                  View all
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Available Products Card */}
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <ShoppingBag size={16} className="mr-1.5 text-green-500" />
                Active Products
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {productSummary.active}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {Math.round(
                    (productSummary.active / productSummary.total) * 100
                  ) || 0}
                  % of inventory
                </p>
                <button
                  onClick={() => setFilter("active")}
                  className="flex items-center text-xs text-green-600 hover:text-green-800"
                >
                  View active
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="bg-red-50 p-4 rounded-md border border-red-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <Tag size={16} className="mr-1.5 text-red-500" />
                Low Stock Items
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {productSummary.lowStock}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Need restock soon</p>
                <button
                  onClick={() => setFilter("lowStock")}
                  className="flex items-center text-xs text-red-600 hover:text-red-800"
                >
                  View items
                  <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Inventory Value Card */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 size={16} className="mr-1.5 text-blue-500" />
                Inventory Value
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                TZS {productSummary.totalValue.toLocaleString()}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Total stock value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === "all"
                ? "bg-primary-100 text-primary-800 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === "active"
                ? "bg-green-100 text-green-800 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === "inactive"
                ? "bg-gray-200 text-gray-800 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setFilter("lowStock")}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === "lowStock"
                ? "bg-red-100 text-red-800 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Low Stock
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
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
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-primary-600 hover:text-primary-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
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
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40 text-gray-400">
            <div className="text-center">
              <Package size={48} className="mx-auto mb-2" />
              <p>No products match the selected filter</p>
              <button
                onClick={() => setFilter("all")}
                className="mt-2 text-sm text-primary-600 hover:text-primary-800"
              >
                View all products
              </button>
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
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={product.images[0].url}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-sm">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        TZS {parseInt(product.unitPrice).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          product.availableQuantity <= product.alertQuantity
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {product.availableQuantity}
                      </div>
                      {product.availableQuantity <= product.alertQuantity && (
                        <div className="text-xs text-red-500">Low stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() =>
                            navigate(`/seller/products/view/${product.id}`)
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title="View Product"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/seller/products/edit/${product.id}`)
                          }
                          className="text-blue-400 hover:text-blue-600"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
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

export default SellerProductsPage;
