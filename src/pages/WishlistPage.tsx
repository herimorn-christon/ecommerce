import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchProductById } from "../redux/slices/productsSlice";
import { removeFromWishlist } from "../redux/slices/wishlistSlice";
import { Product } from "../types";

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  console.log("Wishlist product:", wishlistProducts); // Log the current wishlist items
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    // We no longer need to fetch the wishlist as it's stored locally
    if (!isAuthenticated) {
      setWishlistProducts([]);
    }
  }, [dispatch, isAuthenticated]);

  // Update the products fetching useEffect
  useEffect(() => {
    if (!items?.length) {
      setWishlistProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setProductLoading(true);
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const result = await dispatch(
              fetchProductById(item.productId)
            ).unwrap();
            return result;
          })
        );

        // Filter out any undefined/null results
        const validProducts = results.filter(Boolean);
        setWishlistProducts(validProducts);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setWishlistProducts([]);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [items, dispatch]);

  // Update the handleRemoveFromWishlist function
  const handleRemoveFromWishlist = (productId: string) => {
    // Remove from local Redux store
    dispatch(removeFromWishlist(productId));

    // Update local state
    setWishlistProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter((p) => p.id !== productId);
      return updatedProducts;
    });

    try {
      // No API calls needed anymore
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleAddToCart = (productId: string) => {
    const product = wishlistProducts.find((p) => p.id === productId);
    if (product) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <EmptyState
            icon={<Heart size={40} />}
            title="Please log in to view your wishlist"
            description="You need to be logged in to save and view your favorite products."
            actionLink="/login"
            actionText="Log In"
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (productLoading) {
      return (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (wishlistProducts.length === 0) {
      return (
        <EmptyState
          icon={<Heart size={40} />}
          title="Your wishlist is empty"
          description="You haven't added any products to your wishlist yet."
          actionLink="/products"
          actionText="Browse Products"
        />
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <p className="text-gray-600">
            {wishlistProducts.length} item
            {wishlistProducts.length > 1 ? "s" : ""} in your wishlist
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="p-6 flex flex-col md:flex-row md:items-center relative"
            >
              {/* Sold Out Badge */}
              {product.availableQuantity <= 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Sold Out
                </span>
              )}

              <div className="md:w-1/6 mb-4 md:mb-0">
                <img
                  src={product?.images?.[0]?.url ?? "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>

              <div className="md:w-3/6 md:px-6">
                <Link
                  to={`/products/${product.id}`}
                  className="text-xl font-semibold text-gray-800 hover:text-blue-600 uppercase"
                >
                  {product.name}
                </Link>
                <p className="text-gray-600 mt-1">
                  {product.description
                    ? `${product.description.substring(0, 100)}...`
                    : "No description available."}
                </p>
                <div className="mt-2 text-xl font-bold text-blue-700">
                  {product.unitPrice}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {product.availableQuantity > 0
                    ? `${product.availableQuantity} in stock`
                    : "Out of stock"}
                </div>
              </div>

              <div className="md:w-2/6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0 md:justify-end">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Remove
                </Button>

                <Button
                  variant={
                    product.availableQuantity > 0 ? "primary" : "outline"
                  }
                  size="small"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.availableQuantity <= 0}
                  className="flex items-center justify-center"
                >
                  <ShoppingCart size={16} className="mr-1" />
                  {product.availableQuantity > 0
                    ? "Add to Cart"
                    : "Unavailable"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default WishlistPage;
