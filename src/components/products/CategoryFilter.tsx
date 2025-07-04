import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedCategory } from "../../redux/slices/productsSlice";
import { Category } from "../../types";

interface CategoryFilterProps {
  categories: Category[];
  isLoading: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const { selectedCategory } = useAppSelector((state) => state.products);

  const handleCategoryClick = (category: Category | null) => {
    dispatch(setSelectedCategory(category));
  };

  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse h-8 bg-gray-200 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>

      <div className="space-y-1">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`w-full text-left px-3 py-2 rounded transition-colors ${
            !selectedCategory
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Categories
        </button>

        {safeCategories.map((category) => (
          <div key={category.id} className="flex items-center">
            <button
              onClick={() => handleCategoryClick(category)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                selectedCategory?.id === category.id
                  ? "bg-blue-100 text-blue-800 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
