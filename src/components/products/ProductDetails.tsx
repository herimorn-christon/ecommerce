import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';
import { addProductToWishlist } from '../../redux/slices/wishlistSlice';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProductDetailsProps {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, isLoading, error }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      navigate('/cart');
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      dispatch(addProductToWishlist(product.id));
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && product && value <= product.availableQuantity) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.availableQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading product details: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-8 rounded text-center">
        <p className="text-lg font-medium">Product not found</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to products
        </button>
      </div>
    );
  }

  const isOutOfStock = product.availableQuantity <= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button 
        onClick={() => navigate('/products')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="mb-4 relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '350px' }}>
            {product.images?.length ? (
              <img 
                src={product.images[activeImageIndex].url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm uppercase font-bold tracking-wider py-1 px-3 rounded">
                Out of Stock
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          {product.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                    index === activeImageIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image.url} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center mb-2 space-x-2">
            {product.category?.name && (
              <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {product.category.name}
              </span>
            )}
            <span className="text-sm font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
              {product.storageType}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

          <div className="text-2xl font-bold text-blue-700 mb-4">
            TZS {Number(product.unitPrice).toLocaleString()}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6 space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Availability:</span>{' '}
              {isOutOfStock ? (
                <span className="text-red-600">Out of Stock</span>
              ) : (
                <span className="text-green-600">{product.availableQuantity} in stock</span>
              )}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Storage Type:</span> {product.storageType}
            </p>
            {product.seller?.name && (
              <p className="text-gray-700">
                <span className="font-medium">Seller:</span> {product.seller.name}
              </p>
            )}
          </div>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="flex items-center mb-6">
              <span className="text-gray-700 mr-4">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.availableQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 text-center py-1 border-0 focus:ring-0"
                />
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.availableQuantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              variant="primary"
              fullWidth
              icon={<ShoppingCart size={18} />}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              icon={<Heart size={18} />}
            >
              Wishlist
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start">
              <Truck className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-700">Fast Delivery</p>
                <p className="text-xs text-gray-500">Deliver to your doorstep</p>
              </div>
            </div>

            <div className="flex items-start">
              <ShieldCheck className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-700">Quality Guarantee</p>
                <p className="text-xs text-gray-500">Fresh and high-quality</p>
              </div>
            </div>

            <div className="flex items-start">
              <RefreshCw className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-700">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
