import { ArrowRight, Fish } from "lucide-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductCard from "../components/products/ProductCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchCategories, fetchProducts } from "../redux/slices/productsSlice";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, categories, isLoading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get featured products (we'll just use the first 8 for now)
  // Ensure products is an array before calling slice to prevent runtime errors
  const featuredProducts =
    Array.isArray(products) && products.length > 0 ? products.slice(0, 8) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-primary-800 opacity-70"></div>
          <img
            src="fish.jpg"
            alt="Fish Market"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Fresh Fish from Trusted Fishermen
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              The leading digital marketplace for high-quality fish
              products—delivered straight from local fishers to your table.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-full font-bold text-lg transition-colors inline-block text-center"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-full font-bold text-lg transition-colors inline-block text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Popular Categories
          </h2>
          <p className="text-gray-600 mb-8">
            Browse our most popular fish categories
          </p>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(categories) &&
                categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-40">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-xl font-bold text-white">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              {(!Array.isArray(categories) || categories.length === 0) &&
                !isLoading &&
                !error && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No categories available at the moment.
                  </div>
                )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Fresh catches from our trusted sellers
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {featuredProducts.length === 0 && !isLoading && !error && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No products available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Why Choose Us
          </h2>
          <p className="text-gray-600 mb-12 text-center">
            The best online fish market in Tanzania
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Fish size={32} className="text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fresh Quality
              </h3>
              <p className="text-gray-600">
                We source our fish directly from local fishermen, ensuring the
                freshest catch reaches your table.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-500"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                We deliver your orders promptly, ensuring your fish arrives in
                perfect condition.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-500"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Multiple secure payment options, including mobile money and cash
                on delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Order Fresh Fish?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their seafood
            needs.
          </p>
          <Link
            to="/products"
            className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-full font-bold text-lg transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
