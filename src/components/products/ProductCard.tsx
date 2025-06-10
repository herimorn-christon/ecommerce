import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';
import Button from '../common/Button';
import WishlistButton from './WishlistButton'; // <-- Make sure this path is correct

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = `/products/${product.id}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
  };

  const productImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://placehold.co/300x200?text=No+Image';

  const isOutOfStock = product.availableQuantity <= 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative">
          <img 
            src={productImage} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />

          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs uppercase font-bold tracking-wider py-1 px-2 rounded">
              Out of Stock
            </div>
          )}

          {/* Replaced old wishlist logic with the reusable component */}
          <div className="absolute top-2 left-2">
            <WishlistButton
              productId={product.id}
              className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            />
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {product.category.name}
            </span>
            <span className="ml-2 text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
              {product.storageType}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-bold">
              TZS {Number(product.unitPrice).toLocaleString()}
            </span>
            
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="small"
              variant={isOutOfStock ? "outline" : "primary"}
              icon={<ShoppingCart size={16} />}
            >
              {isOutOfStock ? "Sold Out" : "Add"}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
