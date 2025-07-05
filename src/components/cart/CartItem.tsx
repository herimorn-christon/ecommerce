import React from "react";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../../types";
import { useAppDispatch } from "../../redux/hooks";
import { removeFromCart, updateQuantity } from "../../redux/slices/cartSlice";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;

  const handleRemove = () => {
    dispatch(removeFromCart(product.id));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);
    dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
  };

  // Calculate the item total
  const itemTotal = parseInt(product.unitPrice) * quantity;

  // Get product image
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://placehold.co/100x100?text=No+Image";

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="text-lg font-medium text-gray-800 uppercase">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500">
          Category: {product.category.name}
        </p>
        <p className="text-sm text-gray-500">Storage: {product.storageType}</p>
      </div>

      <div className="flex items-center">
        <div className="mr-6">
          <select
            value={quantity}
            onChange={handleQuantityChange}
            className="p-2 border border-gray-300 rounded"
          >
            {[...Array(Math.min(10, product.availableQuantity))].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="w-24 text-right mr-6">
          <p className="text-lg font-medium text-gray-800">
            TZS {Number(product.unitPrice).toLocaleString()}
          </p>
        </div>

        <div className="w-24 text-right">
          <p className="text-lg font-medium text-blue-700">
            TZS {itemTotal.toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleRemove}
          className="ml-6 text-gray-500 hover:text-red-500"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
