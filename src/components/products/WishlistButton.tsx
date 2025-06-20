import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchProductById } from "../../redux/slices/productsSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/slices/wishlistSlice";

interface WishlistButtonProps {
  productId: string;
  // product?: any; // Optional product object (full product data)
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = "",
  showText = false,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const products = useAppSelector((state) => state.products.products);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (Array.isArray(items)) {
      const found = items.some((item) => item.productId === productId);
      setIsInWishlist(found);
    } else {
      setIsInWishlist(false);
    }
  }, [items, productId]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isInWishlist) {
      // Remove from local wishlist
      dispatch(removeFromWishlist(productId));
      console.log(`Removed product ${productId} from wishlist`);
    } else {
      const storeProduct = products.find((p) => p.id === productId);

      if (storeProduct) {
        // If product is already in the Redux store, add it to wishlist directly
        dispatch(addToWishlist({ product: storeProduct }));
        console.log(`Added product ${productId} to wishlist from store`);
      } else {
        // If product is not in the store, dispatch action to fetch it first
        dispatch(fetchProductById(productId))
          .unwrap()
          .then((fetchedProduct) => {
            dispatch(addToWishlist({ product: fetchedProduct }));
            console.log(`Added product ${productId} to wishlist from API`);
          })
          .catch((error) => console.error("Error fetching product:", error));
      }
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`flex items-center justify-center ${
        isInWishlist ? "text-red-500" : "text-gray-500 hover:text-red-500"
      } transition-colors ${className}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        className={`${
          isInWishlist ? "fill-current" : ""
        } transition-all duration-300`}
      />
      {showText && (
        <span className="ml-2">
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
