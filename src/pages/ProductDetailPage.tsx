import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ProductDetails from "../components/products/ProductDetails";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  clearSelectedProduct,
  fetchProductById,
  fetchRelatedProducts,
} from "../redux/slices/productsSlice";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedProduct, isLoading, error, relatedProducts } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  // Fetch related products when we have a selected product
  useEffect(() => {
    if (selectedProduct?.categoryId) {
      dispatch(fetchRelatedProducts(selectedProduct.categoryId));
    }
  }, [dispatch, selectedProduct?.categoryId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-medium">Back to Products</span>
          </Link>
        </div>

        <ProductDetails
          product={selectedProduct}
          isLoading={isLoading}
          error={error}
        />

        {selectedProduct && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-all group"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-semibold text-primary-600">
                      ${parseFloat(product.unitPrice).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
              {relatedProducts.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No related products found.
                </div>
              )}
              {isLoading && (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
