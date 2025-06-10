import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProductById, clearSelectedProduct } from '../redux/slices/productsSlice';
import ProductDetails from '../components/products/ProductDetails';
import { ArrowLeft } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedProduct, isLoading, error } = useAppSelector(state => state.products);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
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
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* This is a placeholder for related products */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;