import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import Pagination from "../components/common/Pagination";
import CategoryFilter from "../components/products/CategoryFilter";
import ProductGrid from "../components/products/ProductGrid";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCategories,
  fetchProductsPaginated,
  setCurrentPage,
  setItemsPerPage,
} from "../redux/slices/productsSlice";

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    filteredProducts,
    categories,
    isLoading,
    error,
    pagination,
    currentPage,
    itemsPerPage,
    selectedCategory,
  } = useAppSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Calculate pagination values
  const totalPages = Math.ceil(pagination.total / itemsPerPage);

  // Load products with pagination
  const loadProducts = (
    page: number = currentPage,
    search?: string,
    categoryId?: string
  ) => {
    const skip = (page - 1) * itemsPerPage;
    dispatch(
      fetchProductsPaginated({
        skip,
        take: itemsPerPage,
        search: search || debouncedSearchTerm || undefined,
        categoryId: categoryId || selectedCategory?.id || undefined,
      })
    );
  };

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Trigger search when the debounced search term changes
  useEffect(() => {
    loadProducts(1, debouncedSearchTerm);
    dispatch(setCurrentPage(1)); // Reset to first page on search
  }, [debouncedSearchTerm, selectedCategory]);

  // Fetch categories and initial products on mount
  useEffect(() => {
    dispatch(fetchCategories());
    loadProducts(1);
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    loadProducts(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    dispatch(setItemsPerPage(newItemsPerPage));
    dispatch(setCurrentPage(1));
    loadProducts(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Fish Products
            </h1>
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
            <CategoryFilter categories={categories} isLoading={isLoading} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              error={error}
            />

            {/* Pagination */}
            {!isLoading && !error && pagination.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={pagination.total}
                onItemsPerPageChange={handleItemsPerPageChange}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
