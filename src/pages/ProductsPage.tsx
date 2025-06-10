import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProducts, fetchCategories, setSelectedCategory, searchProducts } from '../redux/slices/productsSlice';
import ProductGrid from '../components/products/ProductGrid';
import CategoryFilter from '../components/products/CategoryFilter';
import { Search } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { filteredProducts, categories, isLoading, error } = useAppSelector(state => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Adjust debounce delay as needed (500ms here)

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Trigger search when the debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(searchProducts(debouncedSearchTerm));
    } else {
      dispatch(fetchProducts()); // Fetch all products if the search term is cleared
    }
  }, [debouncedSearchTerm, dispatch]);

  // Fetch categories on initial load
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Fish Products</h1>
            <p className="text-gray-600">Browse our selection of fresh fish</p>
          </div>

          {/* Search Bar */}
          <div className="mt-4 md:mt-0 w-full max-w-md">
            <form className="relative">
              <input
                type="text"
                placeholder="Search for fish products..."
                className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-600 hover:text-blue-500"
                disabled
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar for Desktop */}
          <div className="hidden md:block md:w-64 flex-shrink-0 mr-8">
            <CategoryFilter 
              categories={categories}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ProductGrid 
              products={filteredProducts}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;