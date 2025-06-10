import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addProductToWishlist, removeProductFromWishlist } from '../../redux/slices/wishlistSlice';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className = '', showText = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector(state => state.wishlist);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    console.log("Wishlist items:", items); // Log the current wishlist items

    if (Array.isArray(items)) {
      const found = items.some(item => item.productId === productId);
      setIsInWishlist(found);
      console.log(
        found
          ? `Product ${productId} is in the wishlist`
          : `Product ${productId} is NOT in the wishlist`
      );
    } else {
      setIsInWishlist(false);
      console.log("Wishlist items is not an array");
    }
  }, [items, productId]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      dispatch(removeProductFromWishlist(productId));
      console.log(`Removed product ${productId} from wishlist`);
    } else {
      dispatch(addProductToWishlist(productId));
      console.log(`Added product ${productId} to wishlist`);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`flex items-center justify-center ${isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors ${className}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        size={20} 
        className={`${isInWishlist ? 'fill-current' : ''} transition-all duration-300 ${isLoading ? 'animate-pulse' : ''}`} 
      />
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
